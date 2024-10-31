import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register';
import { LoginDto } from './dto/login.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import {
  HttpStatus,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { ResponseMessage } from 'src/lib';
import { IUser } from 'src/lib/common/interfaces/user.interface';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  const mockUser: IUser = {
    id: 1,
    name: 'John Doe',
    email: 'user@example.com',
    password: 'hashedPassword',
    is_active: true,
    session_token: null,
    session_expires_at: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            register: jest.fn(),
            login: jest.fn(),
            logout: jest.fn(),
            refreshToken: jest.fn(),
            changePassword: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('register', () => {
    it('should register a new user successfully', async () => {
      const registerDto: RegisterDto = {
        name: 'John Doe',
        email: 'user@example.com',
        password: 'SecurePassword123',
      };
      jest.spyOn(authService, 'register').mockResolvedValue({
        success: true,
        statusCode: HttpStatus.CREATED,
        message: ResponseMessage.AUTH.REGISTRATION_SUCCESS,
        data: mockUser,
      });

      const result = await controller.register(registerDto);
      expect(result.statusCode).toBe(HttpStatus.CREATED);
      expect(result.message).toBe(ResponseMessage.AUTH.REGISTRATION_SUCCESS);
      expect(result.data).toEqual(mockUser);
    });

    it('should throw BadRequestException if user already exists', async () => {
      jest
        .spyOn(authService, 'register')
        .mockRejectedValue(
          new BadRequestException(
            ResponseMessage.DYNAMIC.ALREADY_EXISTS('User'),
          ),
        );
      const registerDto: RegisterDto = {
        name: 'John Doe',
        email: 'user@example.com',
        password: 'SecurePassword123',
      };

      await expect(controller.register(registerDto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('login', () => {
    it('should log in a user successfully', async () => {
      const loginDto: LoginDto = {
        email: 'user@example.com',
        password: 'SecurePassword123',
      };
      jest.spyOn(authService, 'login').mockResolvedValue({
        success: true,
        statusCode: HttpStatus.OK,
        message: ResponseMessage.AUTH.LOGIN_SUCCESS,
        data: {
          user: mockUser,
          accessToken: 'access-token',
          refreshToken: 'refresh-token',
        },
      });

      const result = await controller.login(loginDto);
      expect(result.statusCode).toBe(HttpStatus.OK);
      expect(result.message).toBe(ResponseMessage.AUTH.LOGIN_SUCCESS);
      expect(result.data).toHaveProperty('accessToken');
      expect(result.data).toHaveProperty('refreshToken');
    });

    it('should throw UnauthorizedException if login credentials are invalid', async () => {
      jest
        .spyOn(authService, 'login')
        .mockRejectedValue(
          new UnauthorizedException(ResponseMessage.AUTH.LOGIN_INVALID),
        );
      const loginDto: LoginDto = {
        email: 'user@example.com',
        password: 'wrongPassword',
      };

      await expect(controller.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('logout', () => {
    it('should log out the user successfully', async () => {
      jest.spyOn(authService, 'logout').mockResolvedValue({
        success: true,
        statusCode: HttpStatus.OK,
        message: ResponseMessage.AUTH.LOGOUT_SUCCESS,
        data: null,
      });

      const result = await controller.logout('1');
      expect(result.statusCode).toBe(HttpStatus.OK);
      expect(result.message).toBe(ResponseMessage.AUTH.LOGOUT_SUCCESS);
    });
  });

  describe('refreshToken', () => {
    it('should refresh the access token successfully', async () => {
      jest.spyOn(authService, 'refreshToken').mockResolvedValue({
        success: true,
        statusCode: HttpStatus.OK,
        message: ResponseMessage.AUTH.REFRESH_TOKEN_SUCCESS,
        data: { accessToken: 'new-access-token' },
      });

      const result = await controller.refreshToken('valid-refresh-token');
      expect(result.statusCode).toBe(HttpStatus.OK);
      expect(result.message).toBe(ResponseMessage.AUTH.REFRESH_TOKEN_SUCCESS);
      expect(result.data).toHaveProperty('accessToken', 'new-access-token');
    });

    it('should throw UnauthorizedException if refresh token is invalid', async () => {
      jest
        .spyOn(authService, 'refreshToken')
        .mockRejectedValue(
          new UnauthorizedException(ResponseMessage.AUTH.INVALID_TOKEN),
        );
      await expect(
        controller.refreshToken('invalid-refresh-token'),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('changePassword', () => {
    it('should change the password successfully', async () => {
      const changePasswordDto: ChangePasswordDto = {
        currentPassword: 'oldPassword',
        newPassword: 'newPassword123',
        confirmPassword: 'newPassword123',
      };
      jest.spyOn(authService, 'changePassword').mockResolvedValue({
        success: true,
        statusCode: HttpStatus.OK,
        message: ResponseMessage.PASSWORD.CHANGE_SUCCESS,
        data: null,
      });

      const result = await controller.changePassword('1', changePasswordDto);
      expect(result.statusCode).toBe(HttpStatus.OK);
      expect(result.message).toBe(ResponseMessage.PASSWORD.CHANGE_SUCCESS);
    });

    it('should throw BadRequestException if new password and confirmation do not match', async () => {
      const changePasswordDto: ChangePasswordDto = {
        currentPassword: 'oldPassword',
        newPassword: 'newPassword123',
        confirmPassword: 'differentPassword',
      };
      jest
        .spyOn(authService, 'changePassword')
        .mockRejectedValue(
          new BadRequestException(ResponseMessage.AUTH.PASSWORD_MISMATCH),
        );

      await expect(
        controller.changePassword('1', changePasswordDto),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw UnauthorizedException if current password is incorrect', async () => {
      const changePasswordDto: ChangePasswordDto = {
        currentPassword: 'incorrectPassword',
        newPassword: 'newPassword123',
        confirmPassword: 'newPassword123',
      };
      jest
        .spyOn(authService, 'changePassword')
        .mockRejectedValue(
          new UnauthorizedException(ResponseMessage.AUTH.INVALID_PASSWORD),
        );

      await expect(
        controller.changePassword('1', changePasswordDto),
      ).rejects.toThrow(UnauthorizedException);
    });
  });
});
