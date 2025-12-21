
export interface User {
  id: string;
  username: string;
  displayName: string;
  phone?: string;
  email?: string;
  avatarUrl: string;
  isProfileComplete: boolean;
  walletBalance: string;
}

export interface Message {
  id: string;
  senderId: string;
  text: string;
  timestamp: number;
  reactions?: string[];
}

export interface Chat {
  id: string;
  name: string;
  type: 'direct' | 'group' | 'channel' | 'saved';
  lastMessage?: string;
  unreadCount: number;
  membersCount?: number;
  avatar: string;
  isPinned?: boolean;
  isVerified?: boolean;
}

export type AppState = 'LOGIN' | 'LOADING' | 'SETUP' | 'MAIN' | 'CALLING';
export type Theme = 'night' | 'light';
