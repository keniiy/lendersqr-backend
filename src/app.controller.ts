import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  /**
   * Says hello to the caller.
   *
   * @returns A friendly greeting.
   */
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('health-check')
  /**
   * Checks the health of the application.
   *
   * This endpoint returns a simple success message, indicating that the application is healthy.
   *
   * @returns A success message.
   */
  healthCheck(): string {
    return 'OK :)';
  }

  @Get('version')
  /**
   * Retrieves the version of the application.
   *
   * @returns The version number of the application.
   */
  version(): string {
    return '1.0.0';
  }
}
