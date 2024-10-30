import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DalModule } from './lib/dal/dal.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    DalModule,
  ],
})
export class AppModule {}
