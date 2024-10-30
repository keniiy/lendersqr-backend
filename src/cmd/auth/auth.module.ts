import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import {
  UserRepository,
  AdjutorService,
  DalModule,
  TokenService,
  JwtPassportStrategy,
} from 'src/lib';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Module({
  imports: [
    DalModule,
    JwtModule.registerAsync({
      useFactory: (config: ConfigService) => ({
        secret: config.getOrThrow('JWT_SECRET'),
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    UserRepository,
    AdjutorService,
    TokenService,
    JwtPassportStrategy,
  ],
  exports: [AuthService],
})
export class AuthModule {}
