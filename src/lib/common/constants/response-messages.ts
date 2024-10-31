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
  };

  static PASSWORD = {
    CHANGE_SUCCESS:
      'Password changed successfully. You can login anytime with your new password',
  };

  static REQUEST = {
    SUCCESS: 'Request treated successfully',
    FAILURE: 'Oops! Something went wrong. Try again or contact support',
  };

  static PROFILE = {
    NOT_FOUND: 'Profile not found',
    USER_FOUND: 'User found',
  };

  static DYNAMIC = {
    ALREADY_EXISTS: (entity: string): string => `${entity} already exists`,
    NOT_FOUND: (entity: string): string => `${entity} not found`,
  };
}
