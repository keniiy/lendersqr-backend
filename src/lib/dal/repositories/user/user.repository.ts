import { Inject, Injectable } from '@nestjs/common';
import { AbstractRepository } from '../abstract/abstract.repository';
import * as bcrypt from 'bcrypt';
import { KNEX_CONNECTION } from 'src/lib/common/constants/knex.constants';
import { Knex } from 'knex';
import { IUser } from 'src/lib/common/interfaces/user.interface';
import { getConnectionToken } from 'src/lib';

@Injectable()
export class UserRepository extends AbstractRepository<IUser> {
  /**
   * Constructs an instance of UserRepository.
   *
   * @param knex The Knex database connection to be used by the repository.
   */
  constructor(@Inject(getConnectionToken('default')) knex: Knex) {
    super(knex, 'users');
  }

  /**
   * Creates a new user in the database.
   *
   * If the data includes a password, it will be hashed before it is inserted into the database.
   * @param data The partial data object to insert into the database.
   * @returns A promise that resolves with the ID of the newly created record.
   */
  async createUser(data: Partial<IUser>): Promise<number> {
    if (data.password) {
      const saltRounds = 10;
      data.password = await bcrypt.hash(data.password, saltRounds);
    }
    return super.create(data);
  }

  /**
   * Finds a user by their email address.
   *
   * @param email The email address of the user to find.
   * @returns A promise that resolves to the user object if found, or null if no user exists with the given email.
   */
  async findByEmail(email: string): Promise<IUser | null> {
    return this.knex('users').where({ email }).first();
  }

  /**
   * Retrieves a user along with their associated wallet information.
   *
   * @param userId The ID of the user to retrieve.
   * @returns A promise that resolves to an object containing the user and their wallet,
   *          or null if the user does not exist.
   */
  async findUserWithWallet(userId: number) {
    const user = await this.findById(userId);
    if (user) {
      const wallet = await this.knex('wallets').where({ userId }).first();
      return { ...user, wallet };
    }
    return null;
  }
}
