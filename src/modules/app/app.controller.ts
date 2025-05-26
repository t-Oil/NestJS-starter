import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { ApiResource } from '@commons/responses/api-resource';
import { Public } from '@commons/decorators/public.decorator';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Public()
  @Get('health/check')
  healthCheck(): ApiResource {
    const res = this.appService.healthCheck();

    return ApiResource.successResponse(res);
  }
}
