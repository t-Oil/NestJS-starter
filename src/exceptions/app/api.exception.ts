import { HttpException, HttpStatus } from '@nestjs/common';
import { ErrorCodes } from '@exceptions/constants/error-codes.constant';

export class ApiException extends HttpException {
  constructor(
    errorCode: number,
    errors: string[] = [],
    status: number = HttpStatus.UNPROCESSABLE_ENTITY,
  ) {
    super(
      {
        errorCode,
        errorMessage: ErrorCodes[errorCode],
        errors,
      } as HttpExceptionResponseInterface,
      status,
    );
  }
}

export interface HttpExceptionResponseInterface {
  errorCode: number;
  errorMessage: string;
  errors: string[];
  message?: string | string[];
}
