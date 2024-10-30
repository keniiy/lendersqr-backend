import { HttpStatus } from '@nestjs/common';
import { HttpSuccess } from './success';
export class ErrorResponseDto extends HttpSuccess<null> {
  /**
   * Creates a new instance of ErrorResponseDto.
   *
   * @param message The error message to be returned.
   * @param statusCode The HTTP status code, defaults to HttpStatus.BAD_REQUEST.
   */
  constructor(
    message: string,
    statusCode: HttpStatus = HttpStatus.BAD_REQUEST,
  ) {
    super(message, null, statusCode);
    this.success = false;
  }
}
