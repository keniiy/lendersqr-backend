import { Logger, ValidationPipe, VersioningType } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import helmet from 'helmet';
import { SwaggerSetup } from './swagger';
import { HttpExceptionFilter } from '../exceptions';

export interface Environment {
  name: string;
  version: string;
  basePath?: string;
  port: number;
  bearerAuth?: boolean;
  rmqOptions?: any;
}

/**
 * Bootstraps a NestJS application.
 *
 * @param AppModule - The main application module.
 * @param environment - An object containing the environment configuration.
 * @returns A Promise which resolves when the application is ready to start listening.
 */
export async function bootstrapNestApp<T>(
  AppModule: T,
  environment: Environment,
) {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api');
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      forbidUnknownValues: true,
      whitelist: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );
  app.enableVersioning({
    type: VersioningType.URI,
  });
  app.enableCors();
  app.use(helmet());
  app.useGlobalFilters(new HttpExceptionFilter());

  SwaggerSetup(app, {
    title: environment.name,
    description: environment.name + ' Api',
    version: environment.version,
    serviceName: environment.name,
    bearerAuth: environment.bearerAuth,
  });

  const port = environment.port;

  await app.listen(port, () => {
    Logger.log(
      `
      ################################################
      🛡️  ${environment.name} Service is running! Access URLs:
      🏠 Local:      http://localhost:${port}
      ################################################
      `,
    );
    Logger.log(
      `
      ################################################
      🛡️   ${environment.name} swagger doc is running! Access URLs:
      🏠 Local:      http://localhost:${port}/api/${environment.name}/docs
      ################################################
      `,
    );
  });
}
