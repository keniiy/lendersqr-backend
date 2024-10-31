import { ResponseDto } from 'src/lib';
import { ApiProperty } from '@nestjs/swagger';

export class ChangePasswordDto {
  @ApiProperty({
    example:
      'Password changed successfully. You can login anytime with your new password',
  })
  message: string;
}

export class ChangePasswordResponseDto extends ResponseDto {
  @ApiProperty({ type: () => ChangePasswordDto })
  data: ChangePasswordDto;
}
