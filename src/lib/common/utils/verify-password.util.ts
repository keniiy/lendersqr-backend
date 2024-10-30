import * as bcrypt from 'bcrypt';

/**
 * Compares a plaintext password with a hashed password to verify if they match.
 *
 * @param plainPassword - The plaintext password to verify.
 * @param hashedPassword - The hashed password to compare against.
 * @returns A promise that resolves to a boolean indicating whether the passwords match.
 */
export async function verifyPassword(
  plainPassword: string,
  hashedPassword: string,
): Promise<boolean> {
  return bcrypt.compare(plainPassword, hashedPassword);
}
