import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

export interface SwaggerSetupOptions {
  title: string;
  description: string;
  basePath?: string;
  version: string;
  serviceName: string;
  bearerAuth?: boolean;
}

/**
 * Configures Swagger for a NestJS application.
 *
 * @param app - The NestJS application instance.
 * @param option - Configuration options for setting up Swagger.
 * @param option.title - The title of the API documentation.
 * @param option.description - A brief description of the API.
 * @param option.version - The version of the API.
 * @param option.serviceName - The name of the service; used for constructing the docs URL.
 * @param option.bearerAuth - If true, adds Bearer authentication to the API documentation.
 */
export const SwaggerSetup = (
  app: INestApplication,
  option: SwaggerSetupOptions,
) => {
  const options = new DocumentBuilder()
    .setTitle(option.title)
    .setDescription(option.description)
    .setVersion(option.version);

  if (option.bearerAuth) options.addBearerAuth();

  const document = SwaggerModule.createDocument(app, options.build());

  SwaggerModule.setup(
    `api/${option.serviceName.toLowerCase()}/docs`,
    app,
    document,
  );
};
