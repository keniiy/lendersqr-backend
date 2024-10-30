import { Body, Controller, HttpStatus, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiOperation, ApiBody, ApiResponse } from '@nestjs/swagger';
import { ErrorResponseDto, HttpSuccess, ResponseMessage } from 'src/lib';
import { RegisterDto } from './dto/register';
import { IUser } from 'src/lib/common/interfaces/user.interface';
import { RegisterResponseDto } from './dto/res/register.dto.res';

@Controller({
  path: 'auth',
  version: '1',
})
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiBody({ type: RegisterDto })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: ResponseMessage.AUTH.REGISTRATION_SUCCESS,
    type: RegisterResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: `${ResponseMessage.AUTH.BLACKLISTED_USER} or ${ResponseMessage.DYNAMIC.ALREADY_EXISTS('User')}`,
    type: ErrorResponseDto,
  })
  register(@Body() registerDto: RegisterDto): Promise<HttpSuccess<IUser>> {
    return this.authService.register(registerDto);
  }
}
