export interface IAPiResponse<T> {
  success: boolean;
  message?: string;
  statusCode: number;
  data?: T;
}
