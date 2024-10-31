import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import {
  UserRepository,
  TokenService,
  ResponseMessage,
  verifyPassword,
} from 'src/lib';
import { AdjutorService } from 'src/lib/common/integrations/adjustor/adjustor';
import { RegisterDto } from './dto/register';
import { LoginDto } from './dto/login.dto';
import {
  HttpStatus,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { ChangePasswordDto } from './dto/change-password.dto';
import { IUser } from 'src/lib/common/interfaces/user.interface';

jest.mock('src/lib/common/utils/verify-password.util.ts', () => ({
  verifyPassword: jest.fn(),
}));

describe('AuthService', () => {
  let service: AuthService;
  let userRepository: UserRepository;
  let adjutorService: AdjutorService;
  let tokenService: TokenService;

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
      providers: [
        AuthService,
        {
          provide: UserRepository,
          useValue: {
            findByEmail: jest.fn(),
            createUser: jest.fn(),
            clearSessionToken: jest.fn(),
            updateSessionToken: jest.fn(),
            updatePassword: jest.fn(),
            findById: jest.fn(),
          },
        },
        {
          provide: AdjutorService,
          useValue: {
            isUserBlacklisted: jest.fn(),
          },
        },
        {
          provide: TokenService,
          useValue: {
            generateTokens: jest.fn(),
            verifyRefreshToken: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userRepository = module.get<UserRepository>(UserRepository);
    adjutorService = module.get<AdjutorService>(AdjutorService);
    tokenService = module.get<TokenService>(TokenService);

    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('register', () => {
    it('should register a new user successfully', async () => {
      const registerDto: RegisterDto = {
        name: 'John Doe',
        email: 'user@example.com',
        password: 'SecurePassword123',
      };
      jest.spyOn(userRepository, 'findByEmail').mockResolvedValue(null);
      jest.spyOn(adjutorService, 'isUserBlacklisted').mockResolvedValue(false);
      jest.spyOn(userRepository, 'createUser').mockResolvedValue(1);

      const result = await service.register(registerDto);
      expect(result.statusCode).toBe(HttpStatus.CREATED);
      expect(result.message).toBe(ResponseMessage.AUTH.REGISTRATION_SUCCESS);
      expect(userRepository.createUser).toHaveBeenCalledWith(
        expect.objectContaining(registerDto),
      );
    });

    it('should throw BadRequestException if user is already registered', async () => {
      jest.spyOn(userRepository, 'findByEmail').mockResolvedValue(mockUser);
      const registerDto: RegisterDto = {
        name: 'John Doe',
        email: 'user@example.com',
        password: 'SecurePassword123',
      };

      await expect(service.register(registerDto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException if user is blacklisted', async () => {
      jest.spyOn(userRepository, 'findByEmail').mockResolvedValue(null);
      jest.spyOn(adjutorService, 'isUserBlacklisted').mockResolvedValue(true);
      const registerDto: RegisterDto = {
        name: 'John Doe',
        email: 'user@example.com',
        password: 'SecurePassword123',
      };

      await expect(service.register(registerDto)).rejects.toThrow(
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
      jest.spyOn(userRepository, 'findByEmail').mockResolvedValue(mockUser);
      (verifyPassword as jest.Mock).mockResolvedValue(true);
      jest.spyOn(tokenService, 'generateTokens').mockResolvedValue({
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
        expiresAt: new Date(),
      });

      const result = await service.login(loginDto);
      expect(result.statusCode).toBe(HttpStatus.OK);
      expect(result.message).toBe(ResponseMessage.AUTH.LOGIN_SUCCESS);
    });

    it('should throw UnauthorizedException if password is incorrect', async () => {
      const loginDto: LoginDto = {
        email: 'user@example.com',
        password: 'wrongPassword',
      };
      jest.spyOn(userRepository, 'findByEmail').mockResolvedValue(mockUser);
      (verifyPassword as jest.Mock).mockResolvedValue(false);

      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('logout', () => {
    it('should log out a user successfully', async () => {
      jest
        .spyOn(userRepository, 'clearSessionToken')
        .mockResolvedValue(undefined);
      const result = await service.logout(1);
      expect(result.statusCode).toBe(HttpStatus.OK);
      expect(result.message).toBe(ResponseMessage.AUTH.LOGOUT_SUCCESS);
    });
  });

  describe('refreshToken', () => {
    it('should refresh a user token successfully', async () => {
      jest
        .spyOn(tokenService, 'verifyRefreshToken')
        .mockResolvedValue(mockUser.id);
      jest.spyOn(userRepository, 'findById').mockResolvedValue(mockUser);
      jest.spyOn(tokenService, 'generateTokens').mockResolvedValue({
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token',
        expiresAt: new Date(),
      });

      const result = await service.refreshToken('valid-refresh-token');
      expect(result.statusCode).toBe(HttpStatus.OK);
      expect(result.message).toBe(ResponseMessage.AUTH.REFRESH_TOKEN_SUCCESS);
    });

    it('should throw UnauthorizedException if refresh token is invalid', async () => {
      jest.spyOn(tokenService, 'verifyRefreshToken').mockResolvedValue(null);
      await expect(
        service.refreshToken('invalid-refresh-token'),
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
      jest.spyOn(userRepository, 'findById').mockResolvedValue(mockUser);
      jest.spyOn(userRepository, 'updatePassword').mockResolvedValue(undefined);
      (verifyPassword as jest.Mock).mockResolvedValue(true);

      const result = await service.changePassword(1, changePasswordDto);
      expect(result.statusCode).toBe(HttpStatus.OK);
      expect(result.message).toBe(ResponseMessage.PASSWORD.CHANGE_SUCCESS);
    });

    it('should throw UnauthorizedException if current password is incorrect', async () => {
      const changePasswordDto: ChangePasswordDto = {
        currentPassword: 'incorrectPassword',
        newPassword: 'newPassword123',
        confirmPassword: 'newPassword123',
      };

      jest.spyOn(userRepository, 'findById').mockResolvedValue(mockUser);
      (verifyPassword as jest.Mock).mockResolvedValue(false);

      await expect(
        service.changePassword(1, changePasswordDto),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw BadRequestException if new password and confirmation do not match', async () => {
      const changePasswordDto: ChangePasswordDto = {
        currentPassword: 'oldPassword',
        newPassword: 'newPassword123',
        confirmPassword: 'differentPassword123',
      };

      await expect(
        service.changePassword(1, changePasswordDto),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
