import {
  Global,
  Module,
  DynamicModule,
  Provider,
  Type,
  OnApplicationShutdown,
  Inject,
} from '@nestjs/common';
import {
  KnexModuleAsyncOptions,
  KnexModuleOptions,
  KnexOptionsFactory,
} from '../common/interfaces';
import { getConnectionToken, handleRetry } from '../common/utils/knex.util';
import { KNEX_MODULE_OPTIONS } from '../common/constants/knex.constants';
import { knex, Knex } from 'knex';
import { ModuleRef } from '@nestjs/core';
import { defer, lastValueFrom } from 'rxjs';

@Global()
@Module({})
export class KnexCoreModule implements OnApplicationShutdown {
  /**
   * Constructs an instance of KnexCoreModule.
   *
   * @param options - The KnexModuleOptions for configuring the Knex connection.
   * @param moduleRef - The module reference used to resolve dependencies.
   */
  constructor(
    @Inject(KNEX_MODULE_OPTIONS)
    private readonly options: KnexModuleOptions,
    private readonly moduleRef: ModuleRef,
  ) {}

  /**
   * Provides a KnexModuleOptions object and a connection provider which can be injected into services.
   * @param options - The KnexModuleOptions for configuring the Knex connection.
   * @param connection - The name of the connection to be registered. Defaults to 'default'.
   * @returns A DynamicModule which provides the connection.
   */
  public static forRoot(
    options: KnexModuleOptions,
    connection: string = 'default',
  ): DynamicModule {
    const knexModuleOptions = {
      provide: KNEX_MODULE_OPTIONS,
      useValue: options,
    };

    const connectionProvider: Provider = {
      provide: getConnectionToken(connection),
      useFactory: async () => await this.createConnectionFactory(options),
    };

    return {
      module: KnexCoreModule,
      providers: [connectionProvider, knexModuleOptions],
      exports: [connectionProvider],
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
    connection: string = 'default',
  ): DynamicModule {
    const connectionProvider: Provider = {
      provide: getConnectionToken(connection),
      useFactory: async (options: KnexModuleOptions) => {
        return await this.createConnectionFactory(options);
      },
      inject: [KNEX_MODULE_OPTIONS],
    };

    return {
      module: KnexCoreModule,
      imports: options.imports,
      providers: [...this.createAsyncProviders(options), connectionProvider],
      exports: [connectionProvider],
    };
  }

  /**
   * Closes the Knex connection when the application is being shut down.
   * @returns A Promise which resolves when the connection has been closed.
   */
  async onApplicationShutdown(): Promise<any> {
    const connection = this.moduleRef.get<Knex>(
      getConnectionToken(this.options as KnexModuleOptions) as Type<Knex>,
    );
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    connection && (await connection.destroy());
  }

  /**
   * Creates an array of Providers which will be used to create the KnexModuleOptions
   * and the Knex connection. If the options.useExisting or options.useFactory
   * properties are set, it will return an array with a single provider which uses
   * the createAsyncOptionsProvider method to create the options and the connection.
   * If the options.useClass property is set, it will return an array with two providers,
   * one which uses the createAsyncOptionsProvider method to create the options and
   * the connection, and another which uses the useClass property to create an
   * instance of the class which implements the KnexOptionsFactory interface.
   * @param options - The configuration options for the Knex connection.
   * @returns An array of Providers which will be used to create the Knex connection.
   */
  public static createAsyncProviders(
    options: KnexModuleAsyncOptions,
  ): Provider[] {
    if (options.useExisting || options.useFactory) {
      return [this.createAsyncOptionsProvider(options)];
    }

    const useClass = options.useClass as Type<KnexOptionsFactory>;
    return [
      this.createAsyncOptionsProvider(options),
      {
        provide: useClass,
        useClass,
      },
    ];
  }

  /**
   * Creates a Provider which will be used to create the KnexModuleOptions
   * by calling the createKnexOptions method of the class which implements
   * the KnexOptionsFactory interface.
   * @param options - The configuration options for the Knex connection.
   * @returns A Provider which will be used to create the Knex connection.
   */
  public static createAsyncOptionsProvider(
    options: KnexModuleAsyncOptions,
  ): Provider {
    if (options.useFactory) {
      return {
        provide: KNEX_MODULE_OPTIONS,
        useFactory: options.useFactory,
        inject: options.inject || [],
      };
    }

    const inject = [
      (options.useClass || options.useExisting) as Type<KnexOptionsFactory>,
    ];

    return {
      provide: KNEX_MODULE_OPTIONS,
      /**
       * Creates a KnexModuleOptions by calling the createKnexOptions method of the class which implements the KnexOptionsFactory interface.
       * @param optionsFactory - The class which implements the KnexOptionsFactory interface.
       * @returns A Promise which resolves with the KnexModuleOptions to be used to create the Knex connection.
       */
      useFactory: async (
        optionsFactory: KnexOptionsFactory,
      ): Promise<KnexModuleOptions> => {
        return await optionsFactory.createKnexOptions();
      },
      inject,
    };
  }

  /**
   * Creates a Knex connection by calling the knex function with the given config.
   * If the connection fails, it will retry the connection {retryAttempts} times
   * with a delay of {retryDelay} milliseconds between each retry.
   * @param options - The configuration options for the Knex connection.
   * @returns A Promise which resolves with the created Knex connection.
   */
  private static async createConnectionFactory(
    options: KnexModuleOptions,
  ): Promise<Knex> {
    return lastValueFrom(
      defer(async () => {
        return knex(options.config);
      }).pipe(handleRetry(options.retryAttempts, options.retryDelay)),
    );
  }
}
