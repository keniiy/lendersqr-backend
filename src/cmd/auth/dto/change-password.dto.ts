import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  MinLength,
  MaxLength,
  Matches,
  IsNotEmpty,
} from 'class-validator';

export class ChangePasswordDto {
  @ApiProperty({
    description: 'The current password of the user',
    example: 'currentPassword123',
  })
  @IsString()
  @IsNotEmpty({ message: 'Current password cannot be empty' })
  @MinLength(8, { message: 'Current password must be at least 8 characters' })
  currentPassword: string;

  @ApiProperty({
    description: 'The new password of the user',
    example: 'securePassword1234',
  })
  @IsString()
  @MinLength(8, { message: 'New password must be at least 8 characters' })
  @IsNotEmpty({ message: 'New password cannot be empty' })
  @MaxLength(20, {
    message: 'New password must be no longer than 20 characters',
  })
  @Matches(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*?&]{8,}$/, {
    message:
      'New password must contain at least one letter, one number, and be 8-20 characters long',
  })
  newPassword: string;

  @ApiProperty({
    description: 'Confirmation of the new password',
    example: 'securePassword1234',
  })
  @IsString()
  @IsNotEmpty({ message: 'Confirm password cannot be empty' })
  @MinLength(8, { message: 'Confirm password must be at least 8 characters' })
  @MaxLength(20, {
    message: 'Confirm password must be no longer than 20 characters',
  })
  confirmPassword: string;
}
