import { ApiProperty } from '@nestjs/swagger';
import { ResponseDto } from 'src/lib';
import { UserDataDto } from './register.dto.res';

export class LoginDataDto {
  @ApiProperty({
    description: 'Access token for the user session',
    example: 'eyJhbGciOiJI...',
  })
  accessToken: string;

  @ApiProperty({
    description: 'Refresh token for session management',
    example: 'dGhpc2lzYXJlZnJlc2h0b2tlbg==',
  })
  refreshToken: string;

  @ApiProperty({ description: 'User data', type: () => UserDataDto })
  user: UserDataDto;
}

export class LoginResponseDto extends ResponseDto {
  @ApiProperty({
    description: 'Login response data containing tokens and user info',
    type: () => LoginDataDto,
  })
  data: LoginDataDto;
}
