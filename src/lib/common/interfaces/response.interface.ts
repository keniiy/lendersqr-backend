export interface IResponse {
  message: string;
  statusCode: number;
  success: boolean;
}

export type IResponseData<T> = {
  data: T;
} & IResponse;
