import { db } from '@/lib/firebase';
import { collection, doc, setDoc, addDoc, updateDoc, getDoc, getDocs, query, where, orderBy, onSnapshot, serverTimestamp, Timestamp } from 'firebase/firestore';

export interface ChatThread {
  id?: string;
  participants: string[];
  participantData: Record<string, { name: string; role: string }>;
  lastMessage: string;
  lastMessageTime: Timestamp | null;
  unreadCount: Record<string, number>;
  updatedAt: Timestamp | null;
}

export interface ChatMessage {
  id?: string;
  threadId: string;
  senderId: string;
  text: string;
  timestamp: Timestamp | null;
  read: boolean;
}

export const ChatService = {
  
  /**
   * Initializes or gets an existing chat thread between two users.
   */
  async getOrCreateThread(currentUser: {id: string, name: string, role: string}, targetUser: {id: string, name: string, role: string}): Promise<string> {
    const threadId = [currentUser.id, targetUser.id].sort().join('_');
    const threadRef = doc(db, 'chats', threadId);
    
    const threadSnap = await getDoc(threadRef);
    if (!threadSnap.exists()) {
      await setDoc(threadRef, {
        participants: [currentUser.id, targetUser.id],
        participantData: {
          [currentUser.id]: { name: currentUser.name, role: currentUser.role },
          [targetUser.id]: { name: targetUser.name, role: targetUser.role }
        },
        lastMessage: '',
        lastMessageTime: serverTimestamp(),
        unreadCount: {
          [currentUser.id]: 0,
          [targetUser.id]: 0
        },
        updatedAt: serverTimestamp()
      });
    }
    
    return threadId;
  },

  /**
   * Sends a message in a specific thread.
   */
  async sendMessage(threadId: string, senderId: string, targetId: string, text: string) {
    if (!text.trim()) return;
    
    const messageRef = collection(db, `chats/${threadId}/messages`);
    await addDoc(messageRef, {
      threadId,
      senderId,
      text,
      timestamp: serverTimestamp(),
      read: false
    });

    const threadRef = doc(db, 'chats', threadId);
    await updateDoc(threadRef, {
      lastMessage: text,
      lastMessageTime: serverTimestamp(),
      updatedAt: serverTimestamp(),
      [`unreadCount.${targetId}`]: 1 // Simplified increment logic for MVP
    });
  },

  /**
   * Mark thread as read for a specific user
   */
  async markThreadRead(threadId: string, userId: string) {
    const threadRef = doc(db, 'chats', threadId);
    await updateDoc(threadRef, {
      [`unreadCount.${userId}`]: 0
    });
  }
};
