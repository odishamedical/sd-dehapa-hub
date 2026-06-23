import { db } from '@/lib/firebase';
import { collection, doc, setDoc, getDoc, updateDoc, query, where, getDocs, addDoc } from 'firebase/firestore';

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
      await updateDoc(docRef, {
        status,
        updatedAt: new Date().toISOString()
      });
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
  }
};
