import { ApiException } from '@exceptions/app/api.exception';
import { HttpStatus } from '@nestjs/common';

export class AuthException extends ApiException {
  /**
   * @param error
   * @returns ApiException
   */
  static Unauthorized(error?: string[]): ApiException {
    throw new ApiException(900401, error, HttpStatus.UNAUTHORIZED);
  }

  static emailIsInvalidException(error?: string[]): ApiException {
    throw new ApiException(900402, error, HttpStatus.UNAUTHORIZED);
  }

  static guardUnAuthorizedException(error?: string[]): ApiException {
    throw new ApiException(900404, error, HttpStatus.UNAUTHORIZED);
  }

  static AccountIsInactive(error?: string[]): ApiException {
    throw new ApiException(900405, error, HttpStatus.UNAUTHORIZED);
  }

  static AccountPasswordExpired(error?: string[]): ApiException {
    throw new ApiException(900406, error, HttpStatus.UNAUTHORIZED);
  }

  static TokenExpired(error?: string[]): ApiException {
    throw new ApiException(900407, error, HttpStatus.BAD_REQUEST);
  }
}
