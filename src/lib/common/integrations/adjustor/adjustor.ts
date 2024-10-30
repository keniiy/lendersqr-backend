import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { lastValueFrom } from 'rxjs';
import { HttpService } from '@nestjs/axios';
import axios from 'axios';
import { handleApiError } from '../../utils/api-util';
@Injectable()
export class AdjutorService {
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
   * Checks if a user is blacklisted based on their identity
   * @param identity - The user's identity (email, phone number, etc.)
   */
  async isUserBlacklisted(identity: string): Promise<boolean> {
    try {
      const response = await lastValueFrom(
        this.instance.get(`/${identity}`).pipe(),
      );
      return !!response.data.karma_identity; // Returns true if identity is found in Karma
    } catch (error) {
      handleApiError(error, 'AdjutorService');
      return false;
    }
  }
}
