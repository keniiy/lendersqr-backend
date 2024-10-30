import { HttpException, HttpStatus, Logger } from '@nestjs/common';

/**
 * Handles errors from API calls, logging them, and throws a standardized HTTP error
 * @param error - the error object from the API response
 * @param serviceName - the name of the service for logging context
 */
export function handleApiError(error: any, serviceName: string) {
  const logger = new Logger(serviceName);
  logger.error(`Error in ${serviceName}: ${error.message}`);

  if (error.response?.status === HttpStatus.NOT_FOUND) {
    return false;
  }

  throw new HttpException(
    'Error connecting to third-party service',
    HttpStatus.SERVICE_UNAVAILABLE,
  );
}
