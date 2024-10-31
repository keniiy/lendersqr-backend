import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsPositive, IsString } from 'class-validator';

export class TransferFundsDto {
  @ApiProperty({
    description: 'ID or email of the receiver',
    example: '2 or example@domain.com',
  })
  @IsString()
  @IsNotEmpty()
  identifier: string;

  @ApiProperty({ description: 'Amount to transfer', example: 50.0 })
  @IsNumber()
  @IsPositive()
  @IsNotEmpty()
  amount: number;
}
