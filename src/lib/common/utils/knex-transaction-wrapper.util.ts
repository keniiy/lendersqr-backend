import { Knex } from 'knex';
import { asyncWrapper } from './async-wrapper.util';

/**
 * Executes a Knex transaction with automatic error handling.
 *
 * @param knex - The Knex instance.
 * @param callback - The callback containing transaction logic.
 * @returns The result of the transaction, or an error if it fails.
 */
export async function transactionWrapper<T>(
  knex: Knex,
  callback: (trx: Knex.Transaction) => Promise<T>,
  errorMessage = 'Transaction failed',
): Promise<T> {
  return asyncWrapper(async () => {
    return await knex.transaction(async (trx) => {
      return await callback(trx);
    });
  }, errorMessage);
}
