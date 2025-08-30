import { Payment } from '../entities/payments/Payment.js';
import { PaymentRepository } from '../repositories/PaymentRepository.js';

export class PaymentService {
  constructor(private repo: PaymentRepository) {}

  async create(payment: Payment) {
    return this.repo.create(payment);
  }

  async getById(id: string) {
    return this.repo.findById(id);
  }

  async getAll() {
    return this.repo.findAll();
  }
}
