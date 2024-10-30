import { HttpLoggerMiddleware } from './lib/common/middlewares/http-logger.middleware';
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { DalModule } from './lib/dal/dal.module';
import { ClsModule } from 'nestjs-cls';
import { ThrottlerModule } from '@nestjs/throttler';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { APP_GUARD } from '@nestjs/core';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      /**
       * Creates an array of options for the ThrottlerModule.
       * The TTL and limit are retrieved from environment variables.
       * @param configService - The ConfigService which provides the values of the .env file.
       * @returns An array of options for the ThrottlerModule.
       */
      useFactory: (configService: ConfigService) => [
        {
          ttl: parseInt(configService.get<string>('THROTTLE_TTL'), 10),
          limit: parseInt(configService.get<string>('THROTTLE_LIMIT'), 10),
        },
      ],
    }),
    ClsModule.forRoot({
      global: true,
      middleware: { mount: true },
      interceptor: { mount: true },
      guard: { mount: true },
    }),
    DalModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerModule,
    },
  ],
})
export class AppModule implements NestModule {
  /**
   * Applies the HttpLoggerMiddleware to all routes.
   * This middleware is used to log each incoming request.
   * @param consumer - The MiddlewareConsumer to apply the middleware to.
   */
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(HttpLoggerMiddleware).forRoutes('*');
  }
}
