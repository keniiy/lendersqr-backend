import { IsEmail, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({
    example: 'user@example.com',
    description: 'User email address',
  })
  @IsNotEmpty({ message: 'Email cannot be empty' })
  @IsEmail({}, { message: 'Email must be valid' })
  email: string;

  @ApiProperty({
    example: 'SecurePassword123',
    description: 'Password for the account',
  })
  @IsNotEmpty({ message: 'Password cannot be empty' })
  password: string;
}
