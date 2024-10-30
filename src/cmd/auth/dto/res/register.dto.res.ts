import { ApiProperty } from '@nestjs/swagger';
import { ResponseDto } from 'src/lib';

export class UserDataDto {
  @ApiProperty({ description: 'Unique identifier of the user', example: '1' })
  id: string;

  @ApiProperty({ description: 'Full name of the user', example: 'John Doe' })
  name: string;

  @ApiProperty({
    description: 'Email of the user',
    example: 'user@example.com',
  })
  email: string;

  @ApiProperty({
    description: 'Status of user registration',
    example: 'active',
  })
  status: string;
}

export class RegisterResponseDto extends ResponseDto {
  @ApiProperty({
    description: 'Invite user data',
    type: () => UserDataDto,
  })
  data: UserDataDto;
}
