import { Knex } from 'knex';
import { AbstractRepository } from '../abstract/abstract.repository';
import { ITransaction } from 'src/lib/interfaces/transaction.interface';
import { Injectable, Inject } from '@nestjs/common';

@Injectable()
export class AuditLogRepository extends AbstractRepository<ITransaction> {
  constructor(@Inject('KNEX_CONNECTION') knex: Knex) {
    super(knex, 'wallets');
  }
}
