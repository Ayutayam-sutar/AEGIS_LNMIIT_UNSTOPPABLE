export interface Transaction {
  id: string;
  recipient: string;
  amount: string;
  currency: string;
  timestamp: number;
  expiresAt: number;
  status: 'pending' | 'reverted' | 'completed';
}

export interface TrustedAddress {
  id: string;
  name: string;
  address: string;
}

export enum SecurityLevel {
  HIGH = 'High',
  MEDIUM = 'Medium',
  LOW = 'Low'
}