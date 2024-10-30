import { Injectable, BadRequestException, HttpStatus } from '@nestjs/common';
import {
  UserRepository,
  HttpSuccess,
  ResponseMessage,
  normalizeEmail,
} from 'src/lib';
import { AdjutorService } from 'src/lib/common/integrations/adjustor/adjustor';
import { RegisterDto } from './dto/register';

@Injectable()
export class AuthService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly adjutorService: AdjutorService,
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
}
