import { Controller, Get, Headers } from '@nestjs/common';
import { ApiResource } from '@commons/responses/api-resource';
import { MeResource } from '@modules/auth/resources/me.resource';
import { UseResources } from '@interceptors/use-resources.interceptor';
import { MeService } from '@modules/auth/services/me.service';

@Controller('auth/me')
export class MeController {
  constructor(private readonly meService: MeService) {}

  @Get()
  @UseResources(MeResource)
  async me(@Headers('user-id') userId: number): Promise<ApiResource> {
    try {
      const response = await this.meService.getMe(userId);

      return ApiResource.successResponse(response);
    } catch (error) {
      return ApiResource.errorResponse(error);
    }
  }
}
