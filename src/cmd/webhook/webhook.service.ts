import * as crypto from 'crypto';
import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { WalletRepository, ResponseMessage } from 'src/lib';

@Injectable()
export class WebhookService {
  private readonly flwSecretHash: string;
  constructor(
    private readonly walletRepository: WalletRepository,
    private readonly configService: ConfigService,
  ) {
    this.flwSecretHash =
      this.configService.getOrThrow<string>('FLW_SECRET_HASH');
  }

  /**
   * Processes the payment webhook from Flutterwave.
   * Verifies the payment status and funds the user's wallet if successful.
   * @param webhookData - The payload data sent from Flutterwave
   */
  async processPaymentWebhook(
    webhookData: any,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    signature: string,
  ): Promise<void> {
    const { txRef, status } = webhookData;

    // if (!this.verifySignature(JSON.stringify(webhookData), signature))
    //   throw new BadRequestException(ResponseMessage.WEBHOOK.INVALID_SIGNATURE);

    if (!txRef || !status)
      throw new BadRequestException(ResponseMessage.WEBHOOK.INVALID_DATA);

    const [, userId] = txRef.split('-');

    const amount = webhookData.amount;

    if (!userId || amount <= 0)
      throw new BadRequestException(
        ResponseMessage.WEBHOOK.INVALID_TRANSACTION_DETAILS,
      );

    if (status === 'successful') {
      await this.walletRepository.fundWallet(userId, amount);
    } else {
      await this.walletRepository.refundUser(userId, amount);
      await this.logFailedTransaction(
        txRef,
        userId,
        amount,
        `Payment status: ${status}`,
        'fund',
      );
    }
  }
  /**
   * Logs a failed transaction.
   */
  private async logFailedTransaction(
    txRef: string,
    userId: string | number,
    amount: number,
    reason: string,
    type: string,
  ): Promise<void> {
    await this.walletRepository.logFailedTransaction(
      txRef,
      userId,
      amount,
      reason,
      type,
    );
  }

  /**
   * Verifies the webhook signature using the secret hash.
   */
  private verifySignature(payload: string, signature: string): boolean {
    const computedHash = crypto
      .createHmac('sha256', this.flwSecretHash)
      .update(payload)
      .digest('hex');
    return computedHash === signature;
  }
}
