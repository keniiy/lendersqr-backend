import { AppModule } from './app.module';
import { IBootstrapAppConfig } from './lib/common/interfaces/bootstrapApp-config';
import { bootstrapNestApp } from './lib';

const bootstrapConfig: IBootstrapAppConfig = {
  name: 'LenderSquareAPI',
  version: '0.0.1',
  port: parseInt(process.env.PORT) || 3000,
  bearerAuth: true,
};

bootstrapNestApp<typeof AppModule>(AppModule, bootstrapConfig);
