export interface IAuditLog {
  id: number;
  userId: number | null;
  walletId: number | null;
  action: string; // Description of the action (e.g., "USER_CREATED", "FUNDED_WALLET")
  details: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}
