import { DynamicModule, Module } from '@nestjs/common';
import { KnexCoreModule } from './knex-core.module';
import { KnexModuleAsyncOptions, KnexModuleOptions } from '../interfaces';

@Module({})
export class KnexModule {
  /**
   * Creates a DynamicModule which provides a Knex connection.
   * @param options - The configuration options for the Knex connection.
   * @param connection - The name of the connection. Defaults to 'default'.
   * @returns A DynamicModule which provides the connection.
   */
  public static forRoot(
    options: KnexModuleOptions,
    connection?: string,
  ): DynamicModule {
    return {
      module: KnexModule,
      imports: [KnexCoreModule.forRoot(options, connection)],
    };
  }

  /**
   * Creates a DynamicModule which provides a Knex connection.
   * This method is used when the configuration options are loaded asynchronously.
   * @param options - The configuration options for the Knex connection.
   * @param connection - The name of the connection. Defaults to 'default'.
   * @returns A DynamicModule which provides the connection.
   */
  public static forRootAsync(
    options: KnexModuleAsyncOptions,
    connection?: string,
  ): DynamicModule {
    return {
      module: KnexModule,
      imports: [KnexCoreModule.forRootAsync(options, connection)],
    };
  }
}
