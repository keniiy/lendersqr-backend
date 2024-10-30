import { Inject, Injectable } from '@nestjs/common';
import { Knex } from 'knex';
import { IWallet } from 'src/lib/common/interfaces/wallet.interface';
import { AbstractRepository } from '../abstract/abstract.repository';

@Injectable()
export class WalletRepository extends AbstractRepository<IWallet> {
  /**
   * Constructs an instance of WalletRepository.
   *
   * @param knex The Knex database connection to be used by the repository.
   */
  constructor(@Inject('KNEX_CONNECTION') knex: Knex) {
    super(knex, 'wallets');
  }
}
