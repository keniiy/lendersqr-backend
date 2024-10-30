import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UserRepository, AdjutorService, DalModule } from 'src/lib';

@Module({
  imports: [DalModule],
  controllers: [AuthController],
  providers: [AuthService, UserRepository, AdjutorService],
  exports: [AuthService],
})
export class AuthModule {}
