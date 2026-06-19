export type ReservationStatus = 'PENDING' | 'CONFIRMED' | 'PAID' | 'COMPLETED' | 'CANCELLED';
export type PaymentMethod = 'CASH' | 'YAPE' | 'PLIN';
export type FieldStatus = 'ACTIVE' | 'INACTIVE' | 'MAINTENANCE';

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

export interface OwnerProfile {
  id: string;
  email: string;
  fullName: string;
  role: 'OWNER' | 'ADMIN';
}
