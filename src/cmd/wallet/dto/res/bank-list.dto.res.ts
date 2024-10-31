import { ApiProperty } from '@nestjs/swagger';
import { ResponseDto } from 'src/lib';

class BankDto {
  @ApiProperty({ description: 'Bank code', example: '044' })
  code: string;

  @ApiProperty({ description: 'Bank name', example: 'Access Bank' })
  name: string;
}

export class BankListResponseDto extends ResponseDto {
  @ApiProperty({ type: [BankDto], description: 'List of supported banks' })
  data: BankDto[];
}
