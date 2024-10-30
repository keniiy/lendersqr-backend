import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UserRepository } from 'src/lib/dal';
import { IUser } from '../interfaces/user.interface';
import { ResponseMessage } from '../constants';

@Injectable()
export class JwtPassportStrategy extends PassportStrategy(Strategy) {
  private readonly logger: Logger = new Logger(JwtPassportStrategy.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly userRepository: UserRepository,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.getOrThrow<string>('JWT_SECRET'),
    });
  }

  /**
   * Validates the payload of a JWT.
   *
   * @param {any} payload - The payload of the JWT to validate.
   * @return {Promise<IUser>} - A Promise that resolves to the validated user if found, otherwise throws an UnauthorizedException.
   * @throws {UnauthorizedException} - If no user is found.
   */
  async validate(payload: any): Promise<IUser> {
    this.logger.log(`Validating JWT payload: ${JSON.stringify(payload)}`);

    const user = await this.userRepository.findById(payload.id);

    if (!user)
      throw new UnauthorizedException(
        ResponseMessage.DYNAMIC.NOT_FOUND('USER'),
      );

    return user;
  }
}
