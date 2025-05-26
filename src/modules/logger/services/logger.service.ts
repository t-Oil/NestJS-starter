import {
  Injectable,
  Logger as NestLogger,
  LoggerService,
} from '@nestjs/common';
import { Logtail } from '@logtail/node';
import { ConfigService } from '@nestjs/config';

type TErrorDetails = {
  [key: string]: any;
};
@Injectable()
export class Logger implements LoggerService {
  private readonly nestLogger: NestLogger;
  private readonly logtail: Logtail | null;

  constructor(private readonly configService: ConfigService) {
    const logToken = this.configService.get<string>('logtail.token');
    const logEndpoint = this.configService.get<string>('logtail.endpoint');

    this.nestLogger = new NestLogger(Logger.name);
    this.logtail = logToken
      ? new Logtail(logToken, {
        endpoint: logEndpoint,
      })
      : null;
  }

  log(message: string) {
    this.logtail?.info(message);
    this.nestLogger.log(message);
  }

  error(message: string, errors: TErrorDetails) {
    this.logtail?.error(message, errors);
    this.nestLogger.error(message, errors);
  }

  warn(message: string) {
    this.logtail?.warn(message);
    this.nestLogger.warn(message);
  }

  debug(message: string) {
    this.logtail?.debug(message);
    this.nestLogger.debug(message);
  }

  verbose(message: string) {
    this.logtail?.info(message);
    this.nestLogger.verbose(message);
  }
}
