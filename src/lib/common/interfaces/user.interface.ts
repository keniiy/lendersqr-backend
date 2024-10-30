export interface IUser {
  id: number;
  name: string;
  email: string;
  password: string;
  is_active: boolean;
  session_token: string;
  session_expires_at: Date;
  createdAt: Date;
  updatedAt: Date;
}
