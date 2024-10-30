import { Inject, Injectable } from '@nestjs/common';
import { Knex } from 'knex';
import { IWallet } from 'src/lib/interfaces/wallet.interface';
import { AbstractRepository } from '../abstract/abstract.repository';

@Injectable()
export class WalletRepository extends AbstractRepository<IWallet> {
  constructor(@Inject('KNEX_CONNECTION') knex: Knex) {
    super(knex, 'wallets');
  }
}
