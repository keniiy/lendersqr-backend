import { Injectable, BadRequestException } from '@nestjs/common';
import { WalletRepository, ResponseMessage, FlutterWaveService } from 'src/lib';

@Injectable()
export class WebhookService {
  constructor(
    private readonly walletRepository: WalletRepository,
    private readonly flutterWaveService: FlutterWaveService,
  ) {}

  /**
   * Processes the payment webhook from Flutterwave.
   * Verifies the payment status and funds the user's wallet if successful.
   * @param webhookData - The payload data sent from Flutterwave
   */
  async processPaymentWebhook(webhookData: any): Promise<void> {
    const { tx_ref, status } = webhookData;

    if (!tx_ref || !status)
      throw new BadRequestException(ResponseMessage.WEBHOOK.INVALID_DATA);

    const isVerified = await this.flutterWaveService.verifyPayment(tx_ref);

    if (!isVerified)
      throw new BadRequestException(
        ResponseMessage.FLUTTERWAVE_PAYMENT.FAILED_TO_VERIFY_PAYMENT,
      );

    const [, userId] = tx_ref.split('-');

    const amount = webhookData.amount;

    if (!userId || amount <= 0)
      throw new BadRequestException(
        ResponseMessage.WEBHOOK.INVALID_TRANSACTION_DETAILS,
      );

    if (status === 'successful') {
      const isVerified = await this.flutterWaveService.verifyPayment(tx_ref);

      if (isVerified) {
        await this.walletRepository.fundWallet(userId, amount);
      } else {
        await this.logFailedTransaction(
          tx_ref,
          userId,
          amount,
          'Verification failed',
        );
      }
    } else {
      await this.logFailedTransaction(
        tx_ref,
        userId,
        amount,
        `Payment status: ${status}`,
      );
    }
  }

  /**
   * Logs a failed payment transaction for tracking and troubleshooting.
   * @param txRef - The transaction reference ID
   * @param userId - The user ID for the failed transaction
   * @param amount - The amount attempted for payment
   * @param reason - Reason for failure
   */
  private async logFailedTransaction(
    txRef: string,
    userId: string | number,
    amount: number,
    reason: string,
  ): Promise<void> {
    await this.walletRepository.logFailedTransaction(
      txRef,
      userId,
      amount,
      reason,
    );
  }
}
