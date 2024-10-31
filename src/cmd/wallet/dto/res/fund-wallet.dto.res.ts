import { ApiProperty } from '@nestjs/swagger';
import { ResponseDto } from 'src/lib';

export class FundWalletResponseDto extends ResponseDto {
  @ApiProperty({
    description: "URL link to Flutterwave's payment page for funding",
    example: 'https://flutterwave.com/pay/link',
  })
  data: {
    paymentLink: string;
  };
}
