/**
 * Normalizes the provided email to lowercase for consistency.
 * @param email - The email to normalize.
 * @returns The normalized email in lowercase.
 */
export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}
