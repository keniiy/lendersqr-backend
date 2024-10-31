import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsPositive } from 'class-validator';

export class WithdrawDto {
  @ApiProperty({ description: 'Amount to withdraw', example: 50.0 })
  @IsNumber()
  @IsPositive()
  amount: number;

  @ApiProperty({ description: 'Account number', example: 1234567890 })
  @IsNumber()
  accountNumber: number;

  @ApiProperty({ description: 'Bank code', example: 123456 })
  @IsNumber()
  bankCode: number;
}
