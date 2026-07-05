import { db } from '@/lib/firebase';
import { collection, doc, setDoc, getDoc, updateDoc, query, where, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';

export type ConnectionStatus = 'pending' | 'approved' | 'rejected';

export interface NetworkConnection {
  id?: string;
  initiatorId: string;
  initiatorRole: string; // 'patient', 'doctor', 'hospital', 'pharmacy', 'lab', 'ambulance'
  initiatorName: string;
  receiverId: string;
  receiverRole: string;
  receiverName: string;
  status: ConnectionStatus;
  createdAt: string;
  updatedAt: string;
}

export const ConnectionService = {
  /**
   * Request a new connection
   */
  async requestConnection(payload: Omit<NetworkConnection, 'id' | 'status' | 'createdAt' | 'updatedAt'>) {
    try {
      // Check if a connection already exists to prevent duplicates
      const existingQuery = query(
        collection(db, 'connections'),
        where('initiatorId', '==', payload.initiatorId),
        where('receiverId', '==', payload.receiverId)
      );
      
      const existingSnap = await getDocs(existingQuery);
      if (!existingSnap.empty) {
        return existingSnap.docs[0].id; // Already exists
      }

      // Check reverse connection as well
      const reverseQuery = query(
        collection(db, 'connections'),
        where('initiatorId', '==', payload.receiverId),
        where('receiverId', '==', payload.initiatorId)
      );
      const reverseSnap = await getDocs(reverseQuery);
      if (!reverseSnap.empty) {
        return reverseSnap.docs[0].id; // Already exists
      }

      const docRef = await addDoc(collection(db, 'connections'), {
        ...payload,
        status: 'pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });

      // Fetch the receiver's ownerEmail from the directory to send a notification
      try {
        const dirDoc = await getDoc(doc(db, 'directory', payload.receiverId));
        if (dirDoc.exists() && dirDoc.data().ownerEmail) {
          await addDoc(collection(db, 'notifications'), {
            recipientEmail: dirDoc.data().ownerEmail,
            title: `New Connection Request`,
            message: `${payload.initiatorName} has requested to connect with you.`,
            type: 'info',
            read: false,
            link: '/portal#requests',
            createdAt: serverTimestamp()
          });
        }
      } catch (notifErr) {
        console.error("Failed to send notification:", notifErr);
      }

      return docRef.id;
    } catch (err) {
      console.error('Failed to request connection:', err);
      throw err;
    }
  },

  /**
   * Directly create an approved connection (used for Implicit Connections via Services)
   */
  async createApprovedConnection(payload: Omit<NetworkConnection, 'id' | 'status' | 'createdAt' | 'updatedAt'>) {
    try {
      // Check if a connection already exists
      const existingQuery = query(
        collection(db, 'connections'),
        where('initiatorId', '==', payload.initiatorId),
        where('receiverId', '==', payload.receiverId)
      );
      
      const existingSnap = await getDocs(existingQuery);
      if (!existingSnap.empty) {
        const docId = existingSnap.docs[0].id;
        await updateDoc(doc(db, 'connections', docId), { status: 'approved', updatedAt: new Date().toISOString() });
        return docId;
      }

      const reverseQuery = query(
        collection(db, 'connections'),
        where('initiatorId', '==', payload.receiverId),
        where('receiverId', '==', payload.initiatorId)
      );
      const reverseSnap = await getDocs(reverseQuery);
      if (!reverseSnap.empty) {
        const docId = reverseSnap.docs[0].id;
        await updateDoc(doc(db, 'connections', docId), { status: 'approved', updatedAt: new Date().toISOString() });
        return docId;
      }

      const docRef = await addDoc(collection(db, 'connections'), {
        ...payload,
        status: 'approved',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      return docRef.id;
    } catch (err) {
      console.error('Failed to create approved connection:', err);
      throw err;
    }
  },

  /**
   * Update the status of a connection
   */
  async updateConnectionStatus(connectionId: string, status: ConnectionStatus) {
    try {
      const docRef = doc(db, 'connections', connectionId);
      const connDoc = await getDoc(docRef);
      
      await updateDoc(docRef, {
        status,
        updatedAt: new Date().toISOString()
      });

      // Notify the initiator that their request was accepted/rejected
      if (connDoc.exists()) {
        const connData = connDoc.data();
        let recipientEmail = null;
        
        // If initiator is a patient, we assume their ID is their email in the users collection. 
        // Or we just lookup their user doc
        if (connData.initiatorRole === 'patient' || connData.initiatorRole === 'user') {
          // Typically patient ID is their UID, we need to find their email
          const userQuery = query(collection(db, 'users'), where('uid', '==', connData.initiatorId));
          const userSnap = await getDocs(userQuery);
          if (!userSnap.empty) {
            recipientEmail = userSnap.docs[0].data().email;
          }
        } else {
          // If initiator is a provider, look up directory
          const dirDoc = await getDoc(doc(db, 'directory', connData.initiatorId));
          if (dirDoc.exists()) recipientEmail = dirDoc.data().ownerEmail;
        }

        if (recipientEmail) {
           await addDoc(collection(db, 'notifications'), {
             recipientEmail: recipientEmail,
             title: status === 'approved' ? 'Connection Approved' : 'Connection Declined',
             message: `${connData.receiverName} has ${status} your connection request.`,
             type: status === 'approved' ? 'success' : 'warning',
             read: false,
             link: '/portal#network',
             createdAt: serverTimestamp()
           });
        }
      }

    } catch (err) {
      console.error('Failed to update connection status:', err);
      throw err;
    }
  },

  /**
   * Check the current status of a connection between two IDs
   */
  async checkConnectionStatus(userA: string, userB: string): Promise<ConnectionStatus | null> {
    try {
      // Check forward direction
      const forwardQuery = query(
        collection(db, 'connections'),
        where('initiatorId', '==', userA),
        where('receiverId', '==', userB)
      );
      const forwardSnap = await getDocs(forwardQuery);
      if (!forwardSnap.empty) {
        return forwardSnap.docs[0].data().status as ConnectionStatus;
      }

      // Check reverse direction
      const reverseQuery = query(
        collection(db, 'connections'),
        where('initiatorId', '==', userB),
        where('receiverId', '==', userA)
      );
      const reverseSnap = await getDocs(reverseQuery);
      if (!reverseSnap.empty) {
        return reverseSnap.docs[0].data().status as ConnectionStatus;
      }

      return null;
    } catch (err) {
      console.error('Failed to check connection status:', err);
      return null;
    }
  },

  async getConnectionDetails(userA: string, userB: string): Promise<any | null> {
    try {
      // Check forward direction
      const forwardSnap = await getDocs(
        query(
          collection(db, 'connections'),
          where('initiatorId', '==', userA),
          where('receiverId', '==', userB)
        )
      );

      if (!forwardSnap.empty) {
        return { id: forwardSnap.docs[0].id, ...forwardSnap.docs[0].data() };
      }

      // Check reverse direction
      const reverseSnap = await getDocs(
        query(
          collection(db, 'connections'),
          where('initiatorId', '==', userB),
          where('receiverId', '==', userA)
        )
      );

      if (!reverseSnap.empty) {
        return { id: reverseSnap.docs[0].id, ...reverseSnap.docs[0].data() };
      }

      return null;
    } catch (e) {
      console.error("Error fetching connection details", e);
      return null;
    }
  }
};
