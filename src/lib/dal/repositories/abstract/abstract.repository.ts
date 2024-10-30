import { Inject } from '@nestjs/common';
import { Knex } from 'knex';

export abstract class AbstractRepository<T> {
  /**
   * The constructor for the abstract repository.
   * @param knex The Knex database connection to use.
   * @param tableName The name of the table this repository will interact with.
   */
  constructor(
    @Inject('KNEX_CONNECTION') protected readonly knex: Knex,
    private readonly tableName: string,
  ) {}

  /**
   * Retrieves all records from the database.
   *
   * @returns A promise that resolves to an array of all records in the database.
   */
  async findAll(): Promise<T[]> {
    return this.knex(this.tableName).select();
  }

  /**
   * Retrieves a record from the database by its ID.
   *
   * @param id The record ID to retrieve.
   * @returns A promise that resolves to the record if found, or null if it does not exist.
   */
  async findById(id: number | string): Promise<T | null> {
    return this.knex(this.tableName).where({ id }).first();
  }

  /**
   * Inserts a new record into the database.
   *
   * @param data The partial data object to insert into the database.
   * @returns A promise that resolves to the ID of the newly created record.
   */
  async create(data: Partial<T>): Promise<number> {
    const [id] = await this.knex(this.tableName).insert(data);
    return id;
  }

  /**
   * Update a record in the database.
   *
   * @param id The record ID to update.
   * @param data The data to update the record with.
   */
  async update(id: number | string, data: Partial<T>): Promise<void> {
    await this.knex(this.tableName).where({ id }).update(data);
  }

  /**
   * Delete a record from the database.
   *
   * @param id The record ID to delete.
   */
  async delete(id: number | string): Promise<void> {
    await this.knex(this.tableName).where({ id }).delete();
  }
}
