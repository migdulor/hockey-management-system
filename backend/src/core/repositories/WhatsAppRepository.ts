import { WhatsAppMessage } from '../entities/whatsapp/WhatsAppMessage.js';

export interface WhatsAppRepository {
  sendMessage(msg: WhatsAppMessage): Promise<WhatsAppMessage>;
  findById(id: string): Promise<WhatsAppMessage | null>;
  findAll(): Promise<WhatsAppMessage[]>;
}
