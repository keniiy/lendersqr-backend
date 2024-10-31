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
        const wallet = await trx('wallets').where({ user_id: userId }).first();
        if (!wallet)
          throw new BadRequestException(
            ResponseMessage.DYNAMIC.NOT_FOUND('Wallet'),
          );

        await trx('wallets')
          .where({ user_id: userId })
          .increment('balance', amount);

        await trx('transactions').insert({
          wallet_id: wallet.id,
          type: 'fund',
          amount,
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
          amount,
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
        const senderWallet = await trx('wallets')
          .where({ user_id: fromUserId })
          .first();
        const receiverWallet = await trx('wallets')
          .where({ user_id: toUserId })
          .first();

        if (!senderWallet || senderWallet.balance < amount)
          throw new BadRequestException(
            ResponseMessage.WALLET.INSUFFICIENT_BALANCE,
          );

        if (!receiverWallet)
          throw new BadRequestException(
            ResponseMessage.DYNAMIC.NOT_FOUND('Receiver wallet'),
          );

        await trx('wallets')
          .where({ user_id: fromUserId })
          .decrement('balance', amount);
        await trx('wallets')
          .where({ user_id: toUserId })
          .increment('balance', amount);

        await trx('transactions').insert([
          { wallet_id: senderWallet.id, type: 'transfer', amount: -amount },
          { wallet_id: receiverWallet.id, type: 'transfer', amount },
        ]);
      },
      ResponseMessage.WALLET.FAILED_TO_TRANSFER_FUNDS,
    );
  }
}
