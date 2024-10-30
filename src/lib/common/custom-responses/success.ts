import { HttpStatus } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';

export class HttpSuccess<T> {
  @ApiProperty({ example: true })
  success: boolean = true;

  @ApiProperty({ example: 'Operation successful' })
  message: string;

  @ApiProperty({ example: null })
  data: T | null;

  @ApiProperty({ type: Number, example: HttpStatus.OK })
  statusCode: HttpStatus;

  /**
   * Constructs an instance of HttpSuccess.
   *
   * @param message - The success message to be returned.
   * @param data - Optional response data of type T, defaults to null.
   * @param statusCode - The HTTP status code, defaults to HttpStatus.OK.
   */
  constructor(
    message: string,
    data?: T | null,
    statusCode: HttpStatus = HttpStatus.OK,
  ) {
    this.message = message;
    this.data = data ?? null;
    this.statusCode = statusCode;
  }
}
