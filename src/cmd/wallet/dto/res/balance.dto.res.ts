import { ApiProperty } from '@nestjs/swagger';
import { ResponseDto } from 'src/lib';

export class BalanceDataDto {
  @ApiProperty({
    description: "Current balance of the user's wallet",
    example: 1000.0,
  })
  balance: number;
}

export class BalanceResponseDto extends ResponseDto {
  @ApiProperty({
    description: 'Response containing wallet balance information',
    type: BalanceDataDto,
  })
  data: BalanceDataDto;
}
