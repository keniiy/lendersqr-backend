import { Knex } from 'knex';
import { AbstractRepository } from '../abstract/abstract.repository';
import { ITransaction } from 'src/lib/common/interfaces/transaction.interface';
import { Injectable, Inject } from '@nestjs/common';
import { getConnectionToken } from 'src/lib/common/utils/knex.util';

@Injectable()
export class AuditLogRepository extends AbstractRepository<ITransaction> {
  /**
   * Constructs an instance of AuditLogRepository.
   *
   * @param knex The Knex database connection to be used by the repository.
   */
  constructor(@Inject(getConnectionToken('default')) knex: Knex) {
    super(knex, 'wallets');
  }
}
