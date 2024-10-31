export interface ITransaction {
  id: number;
  walletId: number;
  type: 'fund' | 'withdraw' | 'transfer';
  status: 'successful' | 'failed';
  reason?: string;
  amount: number;
  createdAt: Date;
  updatedAt: Date;
}
