import { ApiProperty } from '@nestjs/swagger';

export class BalanceResponseDto {
  @ApiProperty({ description: 'Current balance of the wallet', example: 150.0 })
  balance: number;
}
