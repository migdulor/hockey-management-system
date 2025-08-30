export interface Payment {
  id: string;
  playerId: string;
  amount: number;
  date: Date;
  status: 'pending' | 'completed' | 'failed';
}
