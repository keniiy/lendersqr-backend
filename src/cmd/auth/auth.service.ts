import {
  Injectable,
  BadRequestException,
  HttpStatus,
  UnauthorizedException,
} from '@nestjs/common';
import {
  UserRepository,
  HttpSuccess,
  ResponseMessage,
  normalizeEmail,
  TokenService,
  asyncWrapper,
  verifyPassword,
} from 'src/lib';
import { AdjutorService } from 'src/lib/common/integrations/adjustor/adjustor';
import { RegisterDto } from './dto/register';
import { LoginDto } from './dto/login.dto';
import { IUser } from 'src/lib/common/interfaces/user.interface';
import { ChangePasswordDto } from './dto/change-password.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly adjutorService: AdjutorService,
    private readonly tokenService: TokenService,
  ) {}

  /**
   * Registers a new user after checking if they're blacklisted in Adjutor Karma
   * and if they already exist in the system.
   *
   * @param registerDto - DTO containing registration details
   * @returns newly created user data with success response structure
   */
  async register(registerDto: RegisterDto): Promise<HttpSuccess<any>> {
    const { email, password, name } = registerDto;

    const normalizedEmail = normalizeEmail(email);

    const existingUser = await this.userRepository.findByEmail(normalizedEmail);

    if (existingUser)
      throw new BadRequestException(
        ResponseMessage.DYNAMIC.ALREADY_EXISTS('User'),
      );

    const isBlacklisted =
      await this.adjutorService.isUserBlacklisted(normalizedEmail);

    if (isBlacklisted)
      throw new BadRequestException(ResponseMessage.AUTH.BLACKLISTED_USER);

    const newUser = await this.userRepository.createUser({
      email: normalizedEmail,
      password,
      name,
    });

    return new HttpSuccess(
      ResponseMessage.AUTH.REGISTRATION_SUCCESS,
      newUser,
      HttpStatus.CREATED,
    );
  }

  /**
   * Logs in a user and returns access and refresh tokens.
   * @param loginDto - DTO containing login details.
   * @returns success response with tokens if successful.
   */
  async login(loginDto: LoginDto): Promise<HttpSuccess<any>> {
    const { email, password } = loginDto;
    const normalizedEmail = normalizeEmail(email);

    const user: IUser = await this.userRepository.findByEmail(normalizedEmail);

    if (!user || !(await verifyPassword(password, user.password)))
      throw new UnauthorizedException(ResponseMessage.AUTH.LOGIN_INVALID);

    if (user.session_token && user.session_expires_at > new Date())
      await this.userRepository.clearSessionToken(user.id);

    const { accessToken, refreshToken, expiresAt } =
      await this.tokenService.generateTokens(user);
    await this.userRepository.updateSessionToken(
      user.id,
      accessToken,
      expiresAt,
    );

    return new HttpSuccess(ResponseMessage.AUTH.LOGIN_SUCCESS, {
      user,
      accessToken,
      refreshToken,
    });
  }

  /**
   * Logs out the user by invalidating the session.
   * @param userId - ID of the user to log out.
   */
  async logout(userId: number | string): Promise<HttpSuccess<void>> {
    await asyncWrapper(async () => {
      await this.userRepository.clearSessionToken(userId);
    }, ResponseMessage.AUTH.LOGOUT_SUCCESS);

    return new HttpSuccess(ResponseMessage.AUTH.LOGOUT_SUCCESS);
  }

  /**
   * Refreshes the authentication token for a user.
   *
   * @param refreshToken - The refresh token to verify and use for generating a new access token.
   * @returns A promise resolving to a success response containing the new access token.
   * @throws {UnauthorizedException} If the refresh token is invalid or the user does not exist.
   */
  async refreshToken(refreshToken: string): Promise<HttpSuccess<any>> {
    const userId = await this.tokenService.verifyRefreshToken(refreshToken);

    if (!userId)
      throw new UnauthorizedException(ResponseMessage.AUTH.INVALID_TOKEN);

    const user = await this.userRepository.findById(userId);

    if (!user)
      throw new UnauthorizedException(ResponseMessage.AUTH.INVALID_TOKEN);

    const { accessToken, expiresAt } =
      await this.tokenService.generateTokens(user);

    await this.userRepository.updateSessionToken(
      userId,
      accessToken,
      expiresAt,
    );

    return new HttpSuccess(ResponseMessage.AUTH.REFRESH_TOKEN_SUCCESS, {
      accessToken,
    });
  }

  /**
   * Changes the password for a user.
   * @param userId - The ID of the user to change the password for.
   * @param changePasswordDto - The DTO containing the current password, new password, and password confirmation.
   * @returns A promise resolving to a HTTP success response with a message indicating the password change was successful.
   * @throws {BadRequestException} If the new password and its confirmation do not match.
   * @throws {UnauthorizedException} If the current password is invalid or the user does not exist.
   */
  async changePassword(
    userId: number | string,
    changePasswordDto: ChangePasswordDto,
  ): Promise<HttpSuccess<void>> {
    const { currentPassword, newPassword, confirmPassword } = changePasswordDto;

    if (newPassword !== confirmPassword)
      throw new BadRequestException(ResponseMessage.AUTH.PASSWORD_MISMATCH);

    const user = await this.userRepository.findById(userId);

    if (!user || !(await verifyPassword(currentPassword, user.password)))
      throw new UnauthorizedException(ResponseMessage.AUTH.INVALID_PASSWORD);

    await asyncWrapper(async () => {
      await this.userRepository.update(userId, { password: newPassword });
    }, ResponseMessage.AUTH.CHANGE_PASSWORD_SUCCESS);

    return new HttpSuccess(ResponseMessage.PASSWORD.CHANGE_SUCCESS);
  }
}
