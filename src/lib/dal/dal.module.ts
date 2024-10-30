import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { KnexCoreModule } from '../knex/knex-core.module';

@Module({
  imports: [
    ConfigModule,
    KnexCoreModule.forRootAsync({
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
