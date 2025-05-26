import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  healthCheck(): { status: boolean } {
    return {
      status: true,
    };
  }
}
