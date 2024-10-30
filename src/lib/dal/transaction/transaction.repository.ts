import { ITransaction } from 'src/lib/interfaces/transaction.interface';
import { AbstractRepository } from '../abstract/abstract.repository';
import { Knex } from 'knex';
import { Inject, Injectable } from '@nestjs/common';

@Injectable()
export class TransactionRepository extends AbstractRepository<ITransaction> {
  constructor(@Inject('KNEX_CONNECTION') knex: Knex) {
    super(knex, 'transactions');
  }
}
