import { HttpStatus } from '@nestjs/common';
import { ApiException } from './api.exception';

export class UserException extends ApiException {
  /**
   * @returns ApiException
   */
  static notFound(): ApiException {
    throw new ApiException(100001, [], HttpStatus.OK);
  }

  /**
   * @param error
   * @returns ApiException
   */
  static createError(error?: string[]): ApiException {
    throw new ApiException(100002, error);
  }

  /**
   * @param error
   * @returns ApiException
   */
  static updateError(error?: string[]): ApiException {
    throw new ApiException(100003, error);
  }

  /**
   * @param error
   * @returns ApiException
   */
  static deleteError(error?: string[]): ApiException {
    throw new ApiException(100004, error);
  }

  /**
   * @param error
   * @returns ApiException
   */
  static updatePasswordError(error?: string[]): ApiException {
    throw new ApiException(100006, error);
  }

  /**
   * @param error
   * @returns ApiException
   */
  static updateUserNotActiveError(error?: string[]): ApiException {
    throw new ApiException(100007, error);
  }

  static importUserError(error?: string[]): ApiException {
    throw new ApiException(100008, error);
  }

  static importUserFileIsEmpty(error?: string[]): ApiException {
    throw new ApiException(100009, error);
  }

  static exportUserError(error?: string[]): ApiException {
    throw new ApiException(100010, error);
  }
}
