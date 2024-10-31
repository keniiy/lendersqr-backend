import { Inject, Injectable } from '@nestjs/common';
import { AbstractRepository } from '../abstract/abstract.repository';
import * as bcrypt from 'bcrypt';
import { Knex } from 'knex';
import { IUser } from 'src/lib/common/interfaces/user.interface';
import { asyncWrapper } from 'src/lib';
import { getConnectionToken } from 'src/lib/common/utils/knex.util';

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

  /**
   * Updates the session token for a user.
   *
   * @param userId The ID of the user whose session token should be updated.
   * @param sessionToken The new session token to assign to the user.
   * @param expiresAt The date and time when the new session token expires.
   */

  async updateSessionToken(
    userId: number,
    sessionToken: string,
    expiresAt: Date,
  ): Promise<void> {
    await asyncWrapper(async () => {
      await this.knex('users')
        .where({ id: userId })
        .update({ session_token: sessionToken, session_expires_at: expiresAt });
    });
  }

  /**
   * Clears the session token and its expiration date for a user.
   *
   * @param userId The ID of the user whose session token should be cleared.
   */
  async clearSessionToken(userId: number | string): Promise<void> {
    await asyncWrapper(async () => {
      await this.knex('users')
        .where({ id: userId })
        .update({ session_token: null, session_expires_at: null });
    });
  }

  /**
   * Updates the user's password.
   *
   * Hashes the provided password and updates it in the database
   * for the user with the specified ID.
   *
   * @param userId The ID of the user whose password should be updated.
   * @param password The new password to set for the user.
   * @returns A promise that resolves when the password has been updated.
   */
  async updatePassword(
    userId: number | string,
    password: string,
  ): Promise<void> {
    await asyncWrapper(async () => {
      await this.knex('users')
        .where({ id: userId })
        .update({ password: await bcrypt.hash(password, 10) });
    });
  }
}
