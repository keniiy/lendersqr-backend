import {
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';

export async function asyncWrapper<T>(
  fn: () => Promise<T>,
  errorMessage: string = 'An error occurred',
): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    if (error instanceof BadRequestException) {
      throw new BadRequestException(error?.message || errorMessage);
    } else {
      throw new InternalServerErrorException(errorMessage);
    }
  }
}
