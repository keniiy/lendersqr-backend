export interface IUser {
  id: number;
  name: string;
  email: string;
  password: string;
  is_active: boolean;
  createdAt: Date;
  updatedAt: Date;
}
