export type RecordType = 'DEVO' | 'RECEBER'; // DEVO = I owe, RECEBER = They owe me

export type RecordStatus = 'PENDENTE' | 'PARCIAL' | 'QUITADO';

export interface PaymentTransaction {
  id: string;
  recordId: string;
  type: RecordType;
  amount: number;
  date: string; // ISO date YYYY-MM-DD
  notes?: string;
  createdAt: string; // ISO timestamp
}

export interface PersonRecord {
  id: string;
  userId: string;
  type: RecordType;
  name: string;
  phone?: string;
  photo?: string;
  totalAmount: number;
  paidAmount: number;
  description: string;
  date: string; // ISO date YYYY-MM-DD
  dueDate: string; // ISO date YYYY-MM-DD
  status: RecordStatus;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface MovementHistoryItem {
  id: string;
  userId: string;
  recordId: string;
  personName: string;
  type: RecordType;
  action: 'PAYMENT' | 'RECEIPT' | 'CREATED' | 'EDITED' | 'DELETED';
  amount: number;
  remainingAmount: number;
  date: string;
  description: string;
  createdAt: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  photo?: string;
  createdAt: string;
  themePref?: 'light' | 'dark' | 'system';
  enableNotifications?: boolean;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: 'warning' | 'info' | 'success' | 'danger';
  recordId?: string;
  date: string;
  read: boolean;
}

export interface FilterState {
  search: string;
  status: 'TODOS' | RecordStatus;
  sortBy: 'dueDate' | 'amount' | 'name' | 'createdAt';
  sortOrder: 'asc' | 'desc';
}
