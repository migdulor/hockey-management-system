import { Payment } from '../entities/payments/Payment.js';

export interface PaymentRepository {
  create(payment: Payment): Promise<Payment>;
  findById(id: string): Promise<Payment | null>;
  findAll(): Promise<Payment[]>;
}
