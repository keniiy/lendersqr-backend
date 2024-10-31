import { ApiProperty } from '@nestjs/swagger';
import { ResponseDto } from 'src/lib';

export class TransferFundsResponseDto extends ResponseDto {
  @ApiProperty({
    description: 'Confirmation message for a successful transfer',
    example: 'Transfer successful',
  })
  data: {
    message: string;
  };
}
