import {
  BadRequestException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';

export async function asyncWrapper<T>(
  fn: () => Promise<T>,
  errorMessage: string = 'An error occurred',
): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    Logger.error(`Error from async Wrapper ${error}`);
    if (error instanceof BadRequestException) {
      throw new BadRequestException(error?.message || errorMessage);
    } else {
      throw new InternalServerErrorException(errorMessage);
    }
  }
}
