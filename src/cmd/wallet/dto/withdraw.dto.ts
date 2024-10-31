import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsPositive, Min } from 'class-validator';

export class WithdrawDto {
  @ApiProperty({ description: 'Amount to withdraw', example: 50.0 })
  @IsNotEmpty()
  @Min(100)
  @IsNumber()
  @IsPositive()
  amount: number;

  @ApiProperty({ description: 'Account number', example: 1234567890 })
  @IsNotEmpty()
  accountNumber: number | string;

  @ApiProperty({ description: 'Bank code', example: 123456 })
  @IsNotEmpty()
  bankCode: number | string;
}
