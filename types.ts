
export interface User {
  id: string;
  username: string;
  displayName: string;
  phone?: string;
  email?: string;
  avatarUrl: string;
  isProfileComplete: boolean;
  walletBalance: string;
  isBanned?: boolean;
  isVerified?: boolean;
  loginMethod?: 'github' | 'phone' | 'google';
  registrationDate?: number;
}

export interface PaymentRequest {
  id: string;
  userId: string;
  username: string;
  amount: string;
  method: string;
  timestamp: number;
  status: 'pending' | 'approved' | 'rejected';
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

export interface CallRecord {
  id: string;
  contactName: string;
  avatar: string;
  timestamp: number;
  duration: number;
}

export type AppState = 'LOGIN' | 'LOADING' | 'SETUP' | 'MAIN' | 'CALLING' | 'ADMIN';
export type Theme = 'night' | 'light';
