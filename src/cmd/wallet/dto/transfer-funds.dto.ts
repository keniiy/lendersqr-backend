import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsPositive } from 'class-validator';

export class TransferFundsDto {
  @ApiProperty({ description: 'ID of the receiver', example: 2 })
  toUserId: number;

  @ApiProperty({ description: 'Amount to transfer', example: 50.0 })
  @IsNumber()
  @IsPositive()
  amount: number;
}
