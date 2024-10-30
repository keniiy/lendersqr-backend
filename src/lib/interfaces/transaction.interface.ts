export interface ITransaction {
  id: number;
  walletId: number;
  type: 'fund' | 'withdraw' | 'transfer';
  amount: number;
  createdAt: Date;
  updatedAt: Date;
}
