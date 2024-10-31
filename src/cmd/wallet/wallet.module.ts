import { Module } from '@nestjs/common';
import { WalletService } from './wallet.service';
import { WalletController } from './wallet.controller';
import {
  DalModule,
  FlutterWaveService,
  JwtAuthGuard,
  UserRepository,
  WalletRepository,
} from 'src/lib';

@Module({
  imports: [DalModule],
  controllers: [WalletController],
  providers: [
    WalletService,
    JwtAuthGuard,
    UserRepository,
    WalletRepository,
    FlutterWaveService,
  ],
})
export class WalletModule {}
