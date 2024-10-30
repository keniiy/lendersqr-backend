import { KnexModuleOptions } from './knex-options.interface';

export interface KnexOptionsFactory {
  /**
   * Asynchronously creates options for a Knex connection.
   *
   * @returns A Promise of KnexModuleOptions or a KnexModuleOptions object.
   * @param connectionName The name of the connection for which to create the options.
   */
  createKnexOptions(
    connectionName?: string,
  ): Promise<KnexModuleOptions> | KnexModuleOptions;
}
