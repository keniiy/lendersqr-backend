export class ResponseMessage {
  static AUTH = {
    UNAUTHORIZED: 'Unauthorized Access',
    INVALID_TOKEN: 'Unauthorized access - invalid token provided',
    LOGIN_INVALID: 'Invalid email or password',
    LOGIN_SUCCESS: 'Login successful',
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
  };
}
