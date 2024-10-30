import { Inject, Injectable } from '@nestjs/common';
import { AbstractRepository } from '../abstract/abstract.repository';
import * as bcrypt from 'bcrypt';
import { Knex } from 'knex';
import { IUser } from 'src/lib/interfaces/user.interface';

@Injectable()
export class UserRepository extends AbstractRepository<IUser> {
  constructor(@Inject('KNEX_CONNECTION') knex: Knex) {
    super(knex, 'users');
  }

  async create(data: Partial<IUser>): Promise<number> {
    if (data.password) {
      const saltRounds = 10;
      data.password = await bcrypt.hash(data.password, saltRounds);
    }
    return super.create(data);
  }

  async findUserWithWallet(userId: number) {
    const user = await this.findById(userId);
    if (user) {
      const wallet = await this.knex('wallets').where({ userId }).first();
      return { ...user, wallet };
    }
    return null;
  }
}
