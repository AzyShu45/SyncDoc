
export type Role = 'OWNER' | 'EDITOR' | 'VIEWER';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

export interface Document {
  id: string;
  title: string;
  content: string;
  ownerId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Permission {
  id: string;
  documentId: string;
  userId: string;
  role: Role;
}

export interface Message {
  id: string;
  documentId: string;
  userId: string;
  userName: string;
  text: string;
  timestamp: Date;
  fileUrl?: string;
  fileName?: string;
}

export interface PresenceUser extends User {
  color: string;
}
