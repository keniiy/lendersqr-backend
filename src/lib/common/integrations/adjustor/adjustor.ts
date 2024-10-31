import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { catchError, lastValueFrom, tap } from 'rxjs';
import { HttpService } from '@nestjs/axios';
import axios from 'axios';
import { handleApiError } from '../../utils/api-util';
import { asyncWrapper, ResponseMessage } from 'src/lib';
@Injectable()
export class AdjutorService {
  private readonly logger = new Logger(AdjutorService.name);
  private readonly API_URL =
    'https://adjutor.lendsqr.com/v2/verification/karma';
  private readonly ADJUTOR_SECRET_KEY: string =
    this.configService.getOrThrow<string>('ADJUTOR_API_KEY');

  private instance = new HttpService(
    axios.create({
      baseURL: this.API_URL,
      headers: {
        Authorization: `Bearer ${this.ADJUTOR_SECRET_KEY}`,
        'Content-Type': 'application/json',
        'cache-control': 'no-cache',
      },
    }),
  );

  constructor(private readonly configService: ConfigService) {}

  /**
   * Checks if a user is blacklisted based on their identity.
   * @param identity - email or ID of the user to check
   * @returns true if the user is blacklisted, otherwise false
   */
  async isUserBlacklisted(identity: string): Promise<boolean> {
    return asyncWrapper(async () => {
      this.logger.log(`Starting blacklist check for identity: ${identity}`);

      const response = await lastValueFrom(
        this.instance.get(`/${identity}`).pipe(
          tap(() =>
            this.logger.log(`Request to Adjutor API for identity: ${identity}`),
          ),
          tap((res) =>
            this.logger.log(`Adjutor API Response for ${identity}:`, res.data),
          ),
          catchError((error) => {
            this.logger.error(
              `Error from Adjutor API for identity ${identity}:`,
              error.message,
            );
            handleApiError(error, 'AdjutorService');
            throw error;
          }),
        ),
      );

      if (
        response.data.status === 'success' &&
        response.data.message !== 'Identity not found in karma ecosystem'
      ) {
        console.log(
          `Identity ${identity} found in Karma ecosystem with blacklist status.`,
        );
        return !!response.data.karma_identity;
      } else {
        console.log(`Identity ${identity} not found in Karma ecosystem.`);
        return false;
      }
    }, ResponseMessage.ADJUTOR.FAILED_TO_VERIFY_USER_KARMA);
  }
}
