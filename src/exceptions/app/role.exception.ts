import { HttpStatus } from '@nestjs/common';
import { ApiException } from './api.exception';

export class RoleException extends ApiException {
  /**
   * @returns ApiException
   */
  static notFound(): ApiException {
    throw new ApiException(120001, [], HttpStatus.OK);
  }

  /**
   * @param error
   * @returns ApiException
   */
  static createError(error?: string[]): ApiException {
    throw new ApiException(120002, error);
  }

  /**
   * @param error
   * @returns ApiException
   */
  static updateError(error?: string[]): ApiException {
    throw new ApiException(120003, error);
  }

  /**
   * @param error
   * @returns ApiException
   */
  static deleteError(error?: string[]): ApiException {
    throw new ApiException(120004, error);
  }
}
