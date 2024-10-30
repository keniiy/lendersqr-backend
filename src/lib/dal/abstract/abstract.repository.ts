import { Inject } from '@nestjs/common';
import { Knex } from 'knex';

export abstract class AbstractRepository<T> {
  constructor(
    @Inject('KNEX_CONNECTION') protected readonly knex: Knex,
    private readonly tableName: string,
  ) {}

  async findAll(): Promise<T[]> {
    return this.knex(this.tableName).select();
  }

  async findById(id: number): Promise<T | null> {
    return this.knex(this.tableName).where({ id }).first();
  }

  async create(data: Partial<T>): Promise<number> {
    const [id] = await this.knex(this.tableName).insert(data);
    return id;
  }

  async update(id: number, data: Partial<T>): Promise<void> {
    await this.knex(this.tableName).where({ id }).update(data);
  }

  async delete(id: number): Promise<void> {
    await this.knex(this.tableName).where({ id }).delete();
  }
}
