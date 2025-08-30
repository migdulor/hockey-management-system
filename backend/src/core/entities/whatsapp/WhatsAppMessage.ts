export interface WhatsAppMessage {
  id: string;
  to: string;
  message: string;
  sentAt: Date;
  status: 'pending' | 'sent' | 'failed';
}
