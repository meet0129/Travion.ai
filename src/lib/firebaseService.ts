import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  deleteDoc, 
  query, 
  orderBy, 
  limit,
  where 
} from 'firebase/firestore';
import { db } from './firebase';

export interface ChatData {
  id: string;
  chatId: string;
  title: string;
  tripContext: any;
  messages: any[];
  preferences: any[];
  destinations: any[];
  createdAt: Date;
  updatedAt: Date;
  userId?: string;
}

export class FirebaseChatService {
  private static instance: FirebaseChatService;
  private collectionName = 'chats';

  static getInstance(): FirebaseChatService {
    if (!FirebaseChatService.instance) {
      FirebaseChatService.instance = new FirebaseChatService();
    }
    return FirebaseChatService.instance;
  }

  // Save chat data to Firebase
  async saveChat(chatData: ChatData): Promise<void> {
    try {
      const chatRef = doc(db, this.collectionName, chatData.chatId);
      await setDoc(chatRef, {
        ...chatData,
        createdAt: chatData.createdAt.toISOString(),
        updatedAt: chatData.updatedAt.toISOString(),
      });
      console.log('Chat saved to Firebase:', chatData.chatId);
    } catch (error) {
      console.error('Error saving chat to Firebase:', error);
      throw error;
    }
  }

  // Get chat data from Firebase
  async getChat(chatId: string): Promise<ChatData | null> {
    try {
      const chatRef = doc(db, this.collectionName, chatId);
      const chatSnap = await getDoc(chatRef);
      
      if (chatSnap.exists()) {
        const data = chatSnap.data();
        return {
          ...data,
          createdAt: new Date(data.createdAt),
          updatedAt: new Date(data.updatedAt),
        } as ChatData;
      }
      return null;
    } catch (error) {
      console.error('Error getting chat from Firebase:', error);
      throw error;
    }
  }

  // Get recent chats for a user
  async getRecentChats(userId?: string, limitCount: number = 10): Promise<ChatData[]> {
    try {
      let q = query(
        collection(db, this.collectionName),
        orderBy('updatedAt', 'desc'),
        limit(limitCount)
      );

      if (userId) {
        q = query(
          collection(db, this.collectionName),
          where('userId', '==', userId),
          orderBy('updatedAt', 'desc'),
          limit(limitCount)
        );
      }

      const querySnapshot = await getDocs(q);
      const chats: ChatData[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        chats.push({
          ...data,
          createdAt: new Date(data.createdAt),
          updatedAt: new Date(data.updatedAt),
        } as ChatData);
      });

      return chats;
    } catch (error) {
      console.error('Error getting recent chats from Firebase:', error);
      throw error;
    }
  }

  // Delete chat from Firebase
  async deleteChat(chatId: string): Promise<void> {
    try {
      const chatRef = doc(db, this.collectionName, chatId);
      await deleteDoc(chatRef);
      console.log('Chat deleted from Firebase:', chatId);
    } catch (error) {
      console.error('Error deleting chat from Firebase:', error);
      throw error;
    }
  }

  // Update chat data
  async updateChat(chatId: string, updates: Partial<ChatData>): Promise<void> {
    try {
      const chatRef = doc(db, this.collectionName, chatId);
      await setDoc(chatRef, {
        ...updates,
        updatedAt: new Date().toISOString(),
      }, { merge: true });
      console.log('Chat updated in Firebase:', chatId);
    } catch (error) {
      console.error('Error updating chat in Firebase:', error);
      throw error;
    }
  }
}

export const firebaseChatService = FirebaseChatService.getInstance();


