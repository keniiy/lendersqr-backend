import { Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { IUser } from 'src/lib/common/interfaces/user.interface';
import { ResponseMessage } from '../../constants';
import { asyncWrapper } from '../../utils/async-wrapper.util';

@Injectable()
export class TokenService {
  private readonly logger = new Logger(TokenService.name);
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Generates tokens for a user
   * @param user - The user data for token generation
   * @returns A promise resolving to an object containing the token and expiration
   */
  async generateTokens(user: IUser) {
    return await asyncWrapper(async () => {
      const payload = { id: user.id, email: user.email };
      const expiresIn = this.configService.get<string>('JWT_EXPIRATION');
      const secret = this.configService.get<string>('JWT_SECRET');
      const accessToken = this.jwtService.sign(payload, {
        secret,
        expiresIn,
      });
      const refreshToken = this.jwtService.sign(payload, {
        secret,
        expiresIn,
      });
      return {
        accessToken,
        refreshToken,
        expiresAt: new Date(Date.now() + parseInt(expiresIn, 10) * 1000),
      };
    }, ResponseMessage.TOKEN.UNABLE_TO_GENERATE_TOKEN);
  }

  /**
   * Verifies the token and returns the decoded user data
   * @param token - The JWT to verify
   * @returns A promise resolving to the decoded user data
   */
  async verifyToken(token: string): Promise<IUser | null> {
    return await asyncWrapper(async () => {
      return this.jwtService.verifyAsync<IUser>(token, {
        secret: this.configService.get<string>('JWT_SECRET'),
      });
    }, ResponseMessage.TOKEN.INVALID_OR_EXPIRED_TOKEN);
  }

  /**
   * Verifies the refresh token and returns the user ID if valid.
   * @param refreshToken - The refresh token to verify.
   * @returns The user ID if the refresh token is valid, otherwise throws an error.
   */
  async verifyRefreshToken(refreshToken: string): Promise<number> {
    return await asyncWrapper(async () => {
      const payload = await this.jwtService.verifyAsync(refreshToken, {
        secret: this.configService.getOrThrow<string>('JWT_SECRET'),
      });
      return payload.id;
    }, ResponseMessage.TOKEN.INVALID_OR_EXPIRED_TOKEN);
  }
}
