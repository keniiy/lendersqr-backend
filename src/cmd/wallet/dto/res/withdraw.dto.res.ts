import { ApiProperty } from '@nestjs/swagger';
import { ResponseDto } from 'src/lib';

export class WithdrawResponseDto extends ResponseDto {
  @ApiProperty({
    description: 'Confirmation message for a successful withdrawal',
    example: 'Withdrawal successful',
  })
  data: {
    message: string;
  };
}
