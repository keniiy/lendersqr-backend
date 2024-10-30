import { IResponse } from '../interfaces/response.interface';

export abstract class ResponseDto implements IResponse {
  message: string;
  statusCode: number;
  success: boolean;
  abstract data: any;
}
