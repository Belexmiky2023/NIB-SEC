
export interface User {
  id: string;
  username: string;
  email?: string;
  avatarUrl: string;
  isProfileComplete: boolean;
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
  type: 'direct' | 'group' | 'channel';
  lastMessage?: string;
  unreadCount: number;
  membersCount?: number;
  avatar: string;
}

export type AppState = 'LOGIN' | 'LOADING' | 'SETUP' | 'MAIN' | 'CALLING';
