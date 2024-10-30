import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { KnexCoreModule } from '../knex/knex-core.module';

@Module({
  imports: [
    ConfigModule,
    KnexCoreModule.forRootAsync({
      /**
       * This function creates a Knex configuration object by using the values from the application's .env file.
       * @param configService - The ConfigService which provides the values of the .env file.
       * @returns A Knex configuration object containing the database connection details.
       */
      useFactory: (configService: ConfigService) => ({
        config: {
          client: 'mysql2',
          connection: {
            host: configService.get<string>('DB_HOST'),
            user: configService.get<string>('DB_USER'),
            password: configService.get<string>('DB_PASSWORD'),
            database: configService.get<string>('DB_NAME'),
          },
        },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [],
  exports: [],
})
export class DalModule {}
