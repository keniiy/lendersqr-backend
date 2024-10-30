import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength, MaxLength, Matches } from 'class-validator';

export class ChangePasswordDto {
  @ApiProperty({
    description: 'The current password of the user',
    example: 'currentPassword123',
  })
  @IsString()
  @MinLength(8, { message: 'Current password must be at least 8 characters' })
  currentPassword: string;

  @ApiProperty({
    description: 'The new password of the user',
    example: 'newPassword456',
  })
  @IsString()
  @MinLength(8, { message: 'New password must be at least 8 characters' })
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
    example: 'newPassword456',
  })
  @IsString()
  @MinLength(8, { message: 'Confirm password must be at least 8 characters' })
  @MaxLength(20, {
    message: 'Confirm password must be no longer than 20 characters',
  })
  confirmPassword: string;
}
