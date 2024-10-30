import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  /**
   * This method is called whenever an `HttpException` is thrown.
   * It builds and sends a standardized JSON response back to the client.
   * @param exception The caught `HttpException`.
   * @param host The `ArgumentsHost` object.
   */
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const req = ctx.getRequest<Request>();
    const status = exception.getStatus();
    const request = {
      param: Object.keys(req.params).length ? req.params : undefined,
      body: Object.keys(req.body).length ? req.body : undefined,
      query: Object.keys(req.query).length ? req.query : undefined,
    };
    let message = exception.getResponse();
    message = (message as any).message || (message as any).error;
    response.status(status).json({
      statusCode: status,
      message,
      timestamp: new Date().toISOString(),
      path: req.url,
      request,
    });
  }
}
