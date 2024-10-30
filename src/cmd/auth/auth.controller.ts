import {
  Body,
  Controller,
  HttpStatus,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiOperation, ApiBody, ApiResponse } from '@nestjs/swagger';
import {
  CurrentUser,
  ErrorResponseDto,
  HttpSuccess,
  JwtAuthGuard,
  ResponseMessage,
} from 'src/lib';
import { RegisterDto } from './dto/register';
import { IUser } from 'src/lib/common/interfaces/user.interface';
import { RegisterResponseDto } from './dto/res/register.dto.res';
import { LoginDto } from './dto/login.dto';
import { ChangePasswordDto } from './dto/change-password.dto';

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

  @Post('login')
  @ApiOperation({ summary: 'Log in a user' })
  @ApiBody({ type: LoginDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: ResponseMessage.AUTH.LOGIN_SUCCESS,
    type: RegisterResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: ResponseMessage.AUTH.LOGIN_INVALID,
    type: ErrorResponseDto,
  })
  login(@Body() loginDto: LoginDto): Promise<HttpSuccess<any>> {
    return this.authService.login(loginDto);
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Log out the user' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: ResponseMessage.AUTH.LOGOUT_SUCCESS,
  })
  logout(@CurrentUser('id') userId: string): Promise<HttpSuccess<void>> {
    return this.authService.logout(userId);
  }

  @Post('refresh-token')
  @ApiOperation({ summary: 'Refresh access token' })
  @ApiBody({ description: 'Refresh token' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: ResponseMessage.AUTH.REFRESH_TOKEN_SUCCESS,
    type: RegisterResponseDto,
  })
  refreshToken(
    @Body('refreshToken') refreshToken: string,
  ): Promise<HttpSuccess<any>> {
    return this.authService.refreshToken(refreshToken);
  }

  @Patch('change-password')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Change user password' })
  @ApiBody({ type: ChangePasswordDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: ResponseMessage.PASSWORD.CHANGE_SUCCESS,
  })
  changePassword(
    @CurrentUser('id') userId: string,
    @Body() changePasswordDto: ChangePasswordDto,
  ): Promise<HttpSuccess<void>> {
    return this.authService.changePassword(userId, changePasswordDto);
  }
}
