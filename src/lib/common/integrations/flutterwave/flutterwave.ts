import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';
import axios from 'axios';
import { asyncWrapper } from '../../utils/async-wrapper.util';
import { ResponseMessage } from '../../constants';

@Injectable()
export class FlutterWaveService {
  private readonly logger = new Logger(FlutterWaveService.name);
  private readonly API_URL = 'https://api.flutterwave.com/v3';
  private readonly FLW_SECRET_KEY: string;

  private instance: HttpService;

  /**
   * Constructs an instance of FlutterWaveService.
   * Initializes the HTTP service instance with the Flutterwave API URL and authorization headers.
   * @param configService - The configuration service used to retrieve environment variables.
   * @throws Error if 'FLW_SECRET_KEY' is not found in the configuration.
   */
  constructor(private readonly configService: ConfigService) {
    this.FLW_SECRET_KEY =
      this.configService.getOrThrow<string>('FLW_SECRET_KEY');
    this.instance = new HttpService(
      axios.create({
        baseURL: this.API_URL,
        headers: {
          Authorization: `Bearer ${this.FLW_SECRET_KEY}`,
          'Content-Type': 'application/json',
        },
      }),
    );
  }

  /**
   * Initiates a payment using Flutterwave for a specific amount and user ID.
   * @param amount - Amount to fund the wallet
   * @param userId - Unique identifier of the user initiating the payment
   * @param email - Email address of the user initiating the payment
   * @returns URL link to Flutterwave's payment page for this transaction
   */
  async initiatePayment(
    amount: number,
    userId: number,
    email: string,
  ): Promise<string> {
    return asyncWrapper(async () => {
      const tx_ref = `fund-${userId}-${Date.now()}`;

      const response = await lastValueFrom(
        this.instance.post('/payments', {
          tx_ref,
          amount,
          currency: 'NGN',
          redirect_url:
            this.configService.getOrThrow<string>('FLW_REDIRECT_URL'),
          customer: {
            email,
          },
          meta: {
            consumer_id: userId,
          },
        }),
      );
      return response.data.data.link;
    }, ResponseMessage.FLUTTERWAVE_PAYMENT.FAILED_TO_INITIATE_PAYMENT);
  }

  /**
   * Verifies the payment status for a given transaction reference.
   * @param id - The transaction reference
   * @returns true if the payment was successful, otherwise false
   */
  async verifyPayment(id: string): Promise<boolean> {
    return asyncWrapper(async () => {
      const response = await lastValueFrom(
        this.instance.get(`/transactions/${id}/verify`),
      );
      return response.data.data.status === 'successful';
    }, ResponseMessage.FLUTTERWAVE_PAYMENT.FAILED_TO_VERIFY_PAYMENT);
  }

  /**
   * Initiates a payout to the user's bank account.
   * @param amount - The amount to transfer
   * @param accountNumber - The recipient's bank account number
   * @param bankCode - The bank code of the recipient's bank
   * @returns A boolean indicating success or failure of the payout initiation
   */
  async initiatePayout(
    amount: number,
    accountNumber: string | number,
    bankCode: string | number,
  ): Promise<boolean> {
    //NOTE:  Check if in test mode for simulation seems payout doesn't work on test mode
    const isTestMode = this.configService.get<boolean>('FLW_TEST_MODE', false);

    if (isTestMode) {
      this.logger.log('Simulated payout: no real transfer occurred');
      return true;
    }

    await this.validateAccount(bankCode.toString(), accountNumber.toString());

    return asyncWrapper(async () => {
      const response = await lastValueFrom(
        this.instance.post('/transfers', {
          account_bank: bankCode,
          account_number: accountNumber,
          amount,
          currency: 'NGN',
          narration: 'Wallet withdrawal',
          reference: `withdrawal-${Date.now()}`,
          callback: this.configService.getOrThrow<string>('FLW_CALLBACK_URL'),
          debit_currency: 'NGN',
        }),
      );
      return response.data.status === 'success';
    }, ResponseMessage.FLUTTERWAVE_PAYMENT.PAYOUT_FAILED);
  }

  /**
   * Retrieves a list of supported banks from Flutterwave.
   * @returns Array of supported banks
   */
  async getBankList(): Promise<any[]> {
    return asyncWrapper(async () => {
      const response = await lastValueFrom(this.instance.get('/banks/NG'));
      return response.data.data;
    }, ResponseMessage.FLUTTERWAVE_PAYMENT.FAILED_TO_FETCH);
  }

  /**
   * Validates the bank account details before initiating a payout.
   * @param bankCode - The bank code of the recipient's bank
   * @param accountNumber - The recipient's bank account number
   * @returns The account details if valid, otherwise throws an error
   */
  async validateAccount(bankCode: string, accountNumber: string): Promise<any> {
    return asyncWrapper(async () => {
      const response = await lastValueFrom(
        this.instance.post('/accounts/resolve', {
          account_bank: bankCode,
          account_number: accountNumber,
        }),
      );
      if (response.data.status !== 'success') {
        throw new BadRequestException(
          ResponseMessage.FLUTTERWAVE_PAYMENT.INVALID_ACCOUNT_DETAILS,
        );
      }
      return response.data.data;
    }, ResponseMessage.FLUTTERWAVE_PAYMENT.INVALID_ACCOUNT_DETAILS);
  }
}
