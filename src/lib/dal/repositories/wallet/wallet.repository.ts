import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { Knex } from 'knex';
import { IWallet } from 'src/lib/common/interfaces/wallet.interface';
import { AbstractRepository } from '../abstract/abstract.repository';
import { getConnectionToken } from 'src/lib/common/utils/knex.util';
import {
  FlutterWaveService,
  ResponseMessage,
  transactionWrapper,
} from 'src/lib/common';

@Injectable()
export class WalletRepository extends AbstractRepository<IWallet> {
  /**
   * Constructs an instance of WalletRepository.
   *
   * @param knex The Knex database connection to be used by the repository.
   */
  constructor(
    @Inject(getConnectionToken('default')) knex: Knex,
    private readonly flutterWaveService: FlutterWaveService,
  ) {
    super(knex, 'wallets');
  }

  /**
   * Retrieves a user's wallet.
   *
   * @param userId The ID of the user to retrieve the wallet for.
   * @returns A promise that resolves to the user's wallet, or null if the user does not have a wallet.
   */
  async findWalletByUserId(userId: number | string): Promise<IWallet> {
    const wallet = await this.knex('wallets')
      .where({ user_id: userId })
      .first();
    return wallet;
  }

  /**
   * Checks the balance of a user's wallet.
   * @param userId The ID of the user.
   * @returns The current balance of the user's wallet.
   */
  async getBalance(userId: number | string): Promise<number> {
    const wallet = await this.knex('wallets')
      .where({ user_id: userId })
      .first();
    return wallet ? wallet.balance : 0;
  }

  /**
   * Funds a user's wallet.
   * @param userId The ID of the user whose wallet is being funded.
   * @param amount The amount to fund.
   */
  async fundWallet(userId: number | string, amount: number): Promise<void> {
    if (amount <= 0)
      throw new BadRequestException(
        ResponseMessage.WALLET.AMOUNT_MUST_BE_GREATER_THAN_ZERO,
      );

    await transactionWrapper(
      this.knex,
      async (trx) => {
        const userExists = await trx('users').where({ id: userId }).first();
        if (!userExists)
          throw new BadRequestException(
            ResponseMessage.DYNAMIC.NOT_FOUND('User'),
          );

        let wallet = await trx('wallets').where({ user_id: userId }).first();
        if (!wallet) {
          const [newWalletId] = await trx('wallets')
            .insert({
              user_id: userId,
              balance: 0,
            })
            .returning('id');
          wallet = { id: newWalletId, balance: 0 };
        }

        await trx('wallets')
          .where({ user_id: userId })
          .increment('balance', amount);

        await trx('transactions').insert({
          wallet_id: wallet.id,
          type: 'fund',
          amount,
          status: 'successful',
        });
      },
      ResponseMessage.WALLET.FAILED_TO_FUND_WALLET,
    );
  }

  /**
   * Withdraws funds from a user's wallet.
   * @param userId The ID of the user whose wallet is being debited.
   * @param amount The amount to withdraw.
   */
  async withdraw(
    userId: number | string,
    amount: number,
    accountNumber: string | number,
    bankCode: string | number,
  ): Promise<void> {
    if (amount <= 0)
      throw new BadRequestException(
        ResponseMessage.WALLET.AMOUNT_MUST_BE_GREATER_THAN_ZERO,
      );

    await transactionWrapper(
      this.knex,
      async (trx) => {
        const wallet = await trx('wallets').where({ user_id: userId }).first();
        if (!wallet || wallet.balance < amount)
          throw new BadRequestException(
            ResponseMessage.WALLET.INSUFFICIENT_BALANCE,
          );

        await trx('wallets')
          .where({ user_id: userId })
          .decrement('balance', amount);

        await trx('transactions').insert({
          wallet_id: wallet.id,
          type: 'withdraw',
          amount: -amount,
        });

        const payoutStatus = await this.flutterWaveService.initiatePayout(
          amount,
          accountNumber,
          bankCode,
        );

        if (!payoutStatus) {
          throw new BadRequestException(
            ResponseMessage.FLUTTERWAVE_PAYMENT.PAYOUT_FAILED,
          );
        }
      },
      ResponseMessage.WALLET.FAILED_TO_WITHDRAW_FROM_WALLET,
    );
  }

  /**
   * Transfers funds between two users' wallets.
   * @param fromUserId The ID of the sender.
   * @param toUserId The ID of the receiver.
   * @param amount The amount to transfer.
   */
  async transferFunds(
    fromUserId: number | string,
    toUserId: number | string,
    amount: number,
  ): Promise<void> {
    if (amount <= 0)
      throw new BadRequestException(
        ResponseMessage.WALLET.AMOUNT_MUST_BE_GREATER_THAN_ZERO,
      );

    await transactionWrapper(
      this.knex,
      async (trx) => {
        let senderWallet = await trx('wallets')
          .where({ user_id: fromUserId })
          .first();

        if (!senderWallet) {
          const [newSenderWalletId] = await trx('wallets').insert({
            user_id: fromUserId,
            balance: 0,
          });

          senderWallet = { id: newSenderWalletId, balance: 0 };
        }

        let receiverWallet = await trx('wallets')
          .where({ user_id: toUserId })
          .first();

        if (!receiverWallet) {
          const [newReceiverWalletId] = await trx('wallets').insert({
            user_id: toUserId,
            balance: 0,
          });
          receiverWallet = { id: newReceiverWalletId, balance: 0 };
        }

        if (senderWallet.balance < amount)
          throw new BadRequestException(
            ResponseMessage.WALLET.INSUFFICIENT_BALANCE,
          );

        await trx('wallets')
          .where({ user_id: fromUserId })
          .decrement('balance', amount);
        await trx('wallets')
          .where({ user_id: toUserId })
          .increment('balance', amount);

        await trx('transactions').insert([
          {
            wallet_id: senderWallet.id,
            type: 'transfer',
            amount: -amount,
            status: 'successful',
          },
          {
            wallet_id: receiverWallet.id,
            type: 'transfer',
            amount,
            status: 'successful',
          },
        ]);
      },
      ResponseMessage.WALLET.FAILED_TO_TRANSFER_FUNDS,
    );
  }

  /**
   * Refunds a specified amount to the user's wallet.
   *
   * @param userId - The ID of the user whose wallet is being credited.
   * @param amount - The amount to be refunded.
   * @param trx - The transaction object to be used for database operations.
   *               Defaults to the instance's knex configuration if not provided.
   * @returns A promise that resolves when the refund operation is complete.
   */
  async refundUser(
    userId: number | string,
    amount: number,
    trx = this.knex,
  ): Promise<void> {
    await trx('wallets')
      .where({ user_id: userId })
      .increment('balance', amount);
    await trx('transactions').insert({
      wallet_id: userId,
      type: 'refund',
      amount,
      status: 'successful',
    });
  }

  /**
   * Logs a failed payment transaction for tracking and troubleshooting.
   * @param txRef - The transaction reference ID
   * @param userId - The user ID for the failed transaction
   * @param amount - The amount attempted for payment
   * @param reason - Reason for failure
   */
  async logFailedTransaction(
    txRef: string,
    userId: string | number,
    amount: number,
    reason: string,
    type: string,
  ): Promise<void> {
    await transactionWrapper(
      this.knex,
      async (trx) => {
        await trx('transactions').insert({
          tx_ref: txRef,
          user_id: userId,
          amount,
          type,
          reason,
          created_at: new Date(),
        });
      },
      ResponseMessage.WALLET.FAILED_TO_LOG_TRANSACTION,
    );
  }
}
