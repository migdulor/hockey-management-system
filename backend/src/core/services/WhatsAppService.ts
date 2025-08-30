import { WhatsAppMessage } from '../entities/whatsapp/WhatsAppMessage.js';
import { WhatsAppRepository } from '../repositories/WhatsAppRepository.js';

export class WhatsAppService {
  constructor(private repo: WhatsAppRepository) {}

  async send(msg: WhatsAppMessage) {
    return this.repo.sendMessage(msg);
  }

  async getById(id: string) {
    return this.repo.findById(id);
  }

  async getAll() {
    return this.repo.findAll();
  }
}
