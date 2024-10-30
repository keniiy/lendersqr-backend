import { Inject } from '@nestjs/common';
import { KnexModuleOptions } from '../interfaces/knex-options.interface';
import { getConnectionToken } from '../utils/knex.utils';

export const InjectModel = (connection?: string) => {
  return Inject(getConnectionToken(connection));
};

/**
 * Inject a connection to the database.
 *
 * @param connection The connection name or the KnexModuleOptions to inject.
 * @returns A ParameterDecorator that injects the specified connection.
 */
export const InjectConnection: (
  connection?: KnexModuleOptions | string,
) => ParameterDecorator = (connection?: KnexModuleOptions | string) =>
  Inject(getConnectionToken(connection));
