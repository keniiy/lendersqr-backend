export class ResponseMessage {
  static AUTH = {
    UNAUTHORIZED: 'Unauthorized Access',
    BLACKLISTED_USER: 'User is blacklisted in Adjutor Karma',
    INVALID_TOKEN: 'Unauthorized access - invalid token provided',
    LOGIN_INVALID: 'Invalid email or password',
    LOGIN_SUCCESS: 'Login successful',
    LOGOUT_SUCCESS: 'Logout successful',
    REGISTRATION_SUCCESS: 'Registration successful',
    REFRESH_TOKEN_SUCCESS: 'Refresh token generated successfully',
    INVALID_PASSWORD: 'Invalid password',
    CHANGE_PASSWORD_SUCCESS: 'Password changed successfully',
    PASSWORD_MISMATCH: 'Passwords do not match',
  };

  static TOKEN = {
    UNABLE_TO_GENERATE_TOKEN: 'Unable to generate token',
    INVALID_OR_EXPIRED_TOKEN: 'Invalid or expired token',
  };

  static FLUTTERWAVE_PAYMENT = {
    SUCCESS: 'Payment successful',
    FAILURE: 'Payment failed',
    FAILED_TO_INITIATE_PAYMENT: 'Failed to initiate payment',
    FAILED_TO_VERIFY_PAYMENT: 'Failed to verify payment',
    PAYOUT_FAILED: 'Payout failed',
    FAILED_TO_FETCH: 'Failed to fetch',
  };

  static WALLET = {
    AMOUNT_MUST_BE_GREATER_THAN_ZERO: 'Amount must be greater than zero',
    FAILED_TO_FUND_WALLET: 'Failed to fund wallet',
    INSUFFICIENT_BALANCE: 'Insufficient balance',
    FAILED_TO_WITHDRAW_FROM_WALLET: 'Failed to withdraw from wallet',
    FAILED_TO_TRANSFER_FUNDS: 'Failed to transfer funds',
    FUND_INITIATED: 'Funds initiated successfully',
    INVALID_TRANSFER: 'Invalid transfer',
    FAILED_TO_LOG_TRANSACTION: 'Failed to log transaction',
  };

  static PASSWORD = {
    CHANGE_SUCCESS:
      'Password changed successfully. You can login anytime with your new password',
  };

  static WEBHOOK = {
    INVALID_SIGNATURE: 'Invalid signature',
    INVALID_TRANSACTION_DETAILS: 'Invalid transaction details',
    INVALID_DATA: 'Invalid data',
  };

  static DYNAMIC = {
    ALREADY_EXISTS: (entity: string): string => `${entity} already exists`,
    NOT_FOUND: (entity: string): string => `${entity} not found`,
    SUCCESS: (entity: string): string => `${entity} successfully`,
  };
}
