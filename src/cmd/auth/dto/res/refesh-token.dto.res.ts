import { ApiProperty } from '@nestjs/swagger';
import { ResponseDto } from 'src/lib';

export class RefreshTokenDataDto {
  @ApiProperty({
    description: 'New access token',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  accessToken: string;
}

export class RefreshTokenResponseDto extends ResponseDto {
  @ApiProperty({
    description: 'Data containing the new access token',
    type: () => RefreshTokenDataDto,
  })
  data: RefreshTokenDataDto;
}
