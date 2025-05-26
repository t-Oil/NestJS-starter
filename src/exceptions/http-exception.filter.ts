import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
} from '@nestjs/common';
import { Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus() === 400 ? 200 : exception.getStatus();
    const responseException = exception.getResponse();

    if (typeof responseException['statusCode'] !== 'undefined') {
      const errors = Object();

      if (Array.isArray(responseException['message'])) {
        responseException['message'].forEach((message) => {
          const fieldName = message.substr(0, message.indexOf(' '));

          errors[fieldName] = [message];
        });
      } else {
        Object.assign(errors, [responseException['message']]);
      }

      response.status(status).json({
        status: {
          code: responseException['statusCode'],
          message: responseException['error'],
        },
        error: {
          code: 900000,
          message: responseException['error'],
          errors: errors,
        },
      });
    }

    if (typeof responseException['status'] !== 'undefined') {
      response.status(status).json({
        status: responseException['status'],
        error: responseException['error'],
      });
    }
  }
}
