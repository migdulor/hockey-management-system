import { Payment } from '../entities/payments/Payment.js';
import { PaymentRepository } from './PaymentRepository.js';

export class PaymentRepositoryPostgres implements PaymentRepository {
  async create(payment: Payment): Promise<Payment> {
    // TODO: Implement DB logic
    return payment;
  }
  async findById(id: string): Promise<Payment | null> {
    // TODO: Implement DB logic
    return null;
  }
  async findAll(): Promise<Payment[]> {
    // TODO: Implement DB logic
    return [];
  }
}
