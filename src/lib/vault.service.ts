import { db, storage } from '@/lib/firebase';
import { 
  collection, 
  addDoc, 
  query, 
  where, 
  getDocs, 
  orderBy, 
  serverTimestamp, 
  doc, 
  updateDoc, 
  deleteDoc, 
  increment 
} from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';

export type VaultFolder = 'inbox' | 'sent' | 'archive' | 'trash' | string; // string allows custom folder names

export type VaultDocument = {
  id: string;
  patientName: string;
  patientId: string;
  recordType: 'prescription' | 'mri' | 'lab_report' | 'other';
  fileName: string;
  fileUrl: string;
  fileSize: number;
  uploadDate: any;
  folder: VaultFolder;
  senderId?: string; // For tracking who forwarded it
  senderName?: string;
  isRead?: boolean; // For inbox bolding
  accessLevel?: 'temporary' | 'permanent';
  expiresAt?: any;
  creatorId?: string;
  consultationId?: string;
};

export class VaultService {
  /**
   * Fetch documents for a specific provider and folder
   */
  static async getDocuments(providerId: string, folder: VaultFolder): Promise<VaultDocument[]> {
    if (!providerId) return [];
    try {
      const q = query(
        collection(db, `medicalVault/${providerId}/records`),
        where("folder", "==", folder),
        orderBy('uploadDate', 'desc')
      );
      const snap = await getDocs(q);
      return snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as VaultDocument));
    } catch (error) {
      console.error("Error fetching vault documents:", error);
      return [];
    }
  }

  /**
   * Upload a file and save metadata. Includes 15MB size check.
   */
  static async uploadDocument(
    providerId: string, 
    file: File, 
    metadata: Omit<VaultDocument, 'id' | 'fileUrl' | 'fileSize' | 'uploadDate'>,
    onProgress?: (progress: number) => void
  ): Promise<VaultDocument> {
    
    if (file.size > 15 * 1024 * 1024) {
      throw new Error("File too large. Maximum size is 15MB. Upgrade to Premium for larger files.");
    }

    const safeFileName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.]/g, '')}`;
    const storageRef = ref(storage, `medical-vault/${providerId}/${metadata.patientId}/${safeFileName}`);
    const uploadTask = uploadBytesResumable(storageRef, file);

    return new Promise((resolve, reject) => {
      uploadTask.on('state_changed',
        (snapshot) => {
          if (onProgress) {
            onProgress(Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100));
          }
        },
        (error) => reject(error),
        async () => {
          try {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            
            const docData = {
              ...metadata,
              fileUrl: downloadURL,
              fileSize: file.size,
              uploadDate: serverTimestamp(),
              creatorId: metadata.creatorId || providerId,
              consultationId: metadata.consultationId || `episode_${Date.now()}`
            };

            const docRef = await addDoc(collection(db, `medicalVault/${providerId}/records`), docData);
            
            // Phase 5: Usage & Quota Tracking
            await this.incrementUsageCounter(providerId, 'vaultFilesStored', 1);

            resolve({ id: docRef.id, ...docData } as VaultDocument);
          } catch (e) {
            reject(e);
          }
        }
      );
    });
  }

  /**
   * Move documents between folders (e.g. Inbox -> Archive)
   */
  static async moveDocuments(providerId: string, documentIds: string[], targetFolder: VaultFolder) {
    try {
      const promises = documentIds.map(id => {
        const docRef = doc(db, `medicalVault/${providerId}/records`, id);
        return updateDoc(docRef, { folder: targetFolder });
      });
      await Promise.all(promises);
    } catch (e) {
      console.error("Error moving documents:", e);
      throw e;
    }
  }

  /**
   * Mark a document as read
   */
  static async markAsRead(providerId: string, documentId: string) {
    try {
      const docRef = doc(db, `medicalVault/${providerId}/records`, documentId);
      await updateDoc(docRef, { isRead: true });
    } catch (e) {
      console.error("Error marking document as read:", e);
    }
  }

  /**
   * Delete documents (Moves to Trash, or Hard Delete if already in Trash)
   */
  static async deleteDocuments(providerId: string, documentIds: string[], currentFolder: VaultFolder) {
    try {
      if (currentFolder === 'trash') {
        // Hard Delete
        const promises = documentIds.map(id => deleteDoc(doc(db, `medicalVault/${providerId}/records`, id)));
        await Promise.all(promises);
      } else {
        // Soft Delete -> Move to Trash
        await this.moveDocuments(providerId, documentIds, 'trash');
      }
    } catch (e) {
      console.error("Error deleting documents:", e);
      throw e;
    }
  }

  /**
   * Resolve a Vault Handle (@slug) to a provider ID
   */
  static async resolveVaultHandle(handle: string): Promise<{ id: string, name: string } | null> {
    try {
      const cleanSlug = handle.replace('@', '').toLowerCase().trim();
      const q = query(collection(db, 'directory'), where('customSlug', '==', cleanSlug));
      const snap = await getDocs(q);
      
      if (!snap.empty) {
        const doc = snap.docs[0];
        return { id: doc.id, name: doc.data().name };
      }
      return null;
    } catch (e) {
      console.error("Error resolving handle:", e);
      return null;
    }
  }

  static async forwardDocument(
    senderId: string,
    senderName: string,
    recipientId: string,
    docData: VaultDocument,
    accessLevel: 'temporary' | 'permanent' = 'temporary'
  ) {
    try {
      const expiresAt = accessLevel === 'temporary' ? new Date(Date.now() + 24 * 60 * 60 * 1000) : null;

      // 1. Create a copy in the Recipient's Inbox
      const inboxRef = collection(db, `medicalVault/${recipientId}/records`);
      await addDoc(inboxRef, {
        patientName: docData.patientName,
        patientId: docData.patientId,
        recordType: docData.recordType,
        fileName: docData.fileName,
        fileUrl: docData.fileUrl,
        fileSize: docData.fileSize,
        uploadDate: serverTimestamp(),
        folder: 'inbox',
        isRead: false,
        senderId: senderId,
        senderName: senderName,
        accessLevel: accessLevel,
        expiresAt: expiresAt,
        creatorId: docData.creatorId || senderId,
        consultationId: docData.consultationId || null
      });

      // 2. Create a log in the Sender's Sent folder
      const sentRef = collection(db, `medicalVault/${senderId}/records`);
      await addDoc(sentRef, {
        patientName: docData.patientName,
        patientId: docData.patientId,
        recordType: docData.recordType,
        fileName: docData.fileName,
        fileUrl: docData.fileUrl,
        fileSize: docData.fileSize,
        uploadDate: serverTimestamp(),
        folder: 'sent',
        recipientId: recipientId, // Store who it was sent to
        accessLevel: accessLevel,
        creatorId: docData.creatorId || senderId,
        consultationId: docData.consultationId || null
      });

      // Phase 5 Tracking
      await this.incrementUsageCounter(senderId, 'vaultFilesSent', 1);

    } catch (e) {
      console.error("Error forwarding document:", e);
      throw e;
    }
  }

  /**
   * Helper to increment usage stats on the directory profile
   */
  private static async incrementUsageCounter(providerId: string, field: 'vaultFilesStored' | 'vaultFilesSent', amount: number) {
    try {
      const providerRef = doc(db, 'directory', providerId);
      await updateDoc(providerRef, {
        [field]: increment(amount)
      });
    } catch (e) {
      console.error("Failed to update usage quota", e);
    }
  }
}
