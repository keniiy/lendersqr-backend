import { Module } from '@nestjs/common';
import { WebhookService } from './webhook.service';
import { WebhookController } from './webhook.controller';
import { DalModule, FlutterWaveService, WalletRepository } from 'src/lib';

@Module({
  imports: [DalModule],
  controllers: [WebhookController],
  providers: [WebhookService, WalletRepository, FlutterWaveService],
})
export class WebhookModule {}
