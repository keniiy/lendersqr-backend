import { ITransaction } from 'src/lib/common/interfaces/transaction.interface';
import { AbstractRepository } from '../abstract/abstract.repository';
import { Knex } from 'knex';
import { Inject, Injectable } from '@nestjs/common';
import { getConnectionToken } from 'src/lib/common/utils/knex.util';

@Injectable()
export class TransactionRepository extends AbstractRepository<ITransaction> {
  /**
   * Constructs an instance of TransactionRepository.
   *
   * @param knex The Knex database connection to be used by the repository.
   */
  constructor(@Inject(getConnectionToken('default')) knex: Knex) {
    super(knex, 'transactions');
  }
}
