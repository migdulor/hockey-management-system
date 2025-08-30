import { WhatsAppMessage } from '../entities/whatsapp/WhatsAppMessage.js';
import { WhatsAppRepository } from './WhatsAppRepository.js';

export class WhatsAppRepositoryPostgres implements WhatsAppRepository {
  async sendMessage(msg: WhatsAppMessage): Promise<WhatsAppMessage> {
    // TODO: Implement DB logic or API integration
    return msg;
  }
  async findById(id: string): Promise<WhatsAppMessage | null> {
    // TODO: Implement DB logic
    return null;
  }
  async findAll(): Promise<WhatsAppMessage[]> {
    // TODO: Implement DB logic
    return [];
  }
}
