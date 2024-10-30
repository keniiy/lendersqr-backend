/* eslint-disable @typescript-eslint/no-unsafe-function-type */
import { KnexModuleOptions } from '../interfaces';
import { DEFAULT_CONNECTION_NAME } from '../../knex/knex.constants';
import { Observable } from 'rxjs';
import { delay, retryWhen, scan } from 'rxjs/operators';
import { randomUUID } from 'node:crypto';
import { Logger } from '@nestjs/common';
import { CircularDependencyException } from '../exceptions/circular-dependency.exception';

const logger = new Logger('KnexModule');

/**
 * This function generates an injection token for an Model
 * @param {Function} This parameter can either be a Model
 * @param {string} [connection='default'] Connection name
 * @returns {string} The Entity injection token
 */
export function getModelToken(
  model: Function,
  connection: KnexModuleOptions | string = DEFAULT_CONNECTION_NAME,
) {
  if (model === null || model === undefined) {
    throw new CircularDependencyException('@InjectModel()');
  }
  const connectionPrefix = getConnectionPrefix(connection);
  return `${connectionPrefix}${model.name}`;
}

/**
 * This function returns a Connection injection token based on the connection name
 * @param {KnexModuleOptions | string} [connection='default'] This optional parameter is either
 * a KnexModuleOptions or a string.
 * @returns {string | Function} The Connection injection token.
 */
export function getConnectionToken(
  connection: KnexModuleOptions | string = DEFAULT_CONNECTION_NAME,
): string | Function {
  if (typeof connection === 'string') {
    return connection;
  }
  return `${connection.name || DEFAULT_CONNECTION_NAME}`;
}

/**
 * This function returns a Connection prefix based on the connection name
 * @param {KnexModuleOptions | string} [connection='default'] This optional parameter is either
 * a KnexModuleOptions or a string.
 * @returns {string | Function} The Connection injection token.
 */
export function getConnectionPrefix(
  connection: KnexModuleOptions | string = DEFAULT_CONNECTION_NAME,
): string {
  if (connection === DEFAULT_CONNECTION_NAME) {
    return '';
  }
  if (typeof connection === 'string') {
    return connection + '_';
  }
  if (connection.name === DEFAULT_CONNECTION_NAME || !connection.name) {
    return '';
  }
  return connection.name + '_';
}

/**
 * This function will retry a failed connection to the database.
 * The function will retry {retryAttempts} times, with a delay of
 * {retryDelay} milliseconds between each retry.
 * @param retryAttempts The number of times to retry the connection.
 * @param retryDelay The delay in milliseconds between each retry.
 * @returns {Function} A function which will retry the connection.
 */
export function handleRetry(
  retryAttempts = 9,
  retryDelay = 3000,
): <T>(source: Observable<T>) => Observable<T> {
  return <T>(source: Observable<T>) =>
    source.pipe(
      retryWhen((e) =>
        e.pipe(
          scan((errorCount, error: Error) => {
            logger.error(
              `Unable to connect to the database. Retrying (${
                errorCount + 1
              })...`,
              error.stack,
            );
            if (errorCount + 1 >= retryAttempts) {
              throw error;
            }
            return errorCount + 1;
          }, 0),
          delay(retryDelay),
        ),
      ),
    );
}

/**
 * Returns the connection name from the given options object.
 * If the options object does not contain a name, the default
 * connection name is returned.
 * @param options The options object.
 * @returns The connection name.
 */
export function getConnectionName(options: KnexModuleOptions) {
  return options && options.name ? options.name : DEFAULT_CONNECTION_NAME;
}

export const generateString = () => randomUUID();
