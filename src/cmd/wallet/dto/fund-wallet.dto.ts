import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsPositive } from 'class-validator';

export class FundWalletDto {
  @ApiProperty({ description: 'Amount to fund the wallet', example: 100.0 })
  @IsNumber()
  @IsPositive()
  amount: number;
}
