import { Body, Controller, Post } from '@nestjs/common';
import { ApiResource } from '@commons/responses/api-resource';
import { UseResources } from '@interceptors/use-resources.interceptor';
import { Public } from '@commons/decorators/public.decorator';
import { AuthService } from '@modules/auth/services/auth.service';
import { LoginRequest } from '@modules/auth/requests/login.request';
import { LoginResource } from '@modules/auth/resources/login.resource';
import { RefreshLoginRequest } from '@modules/auth/requests/refresh-login.request';

@Public()
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @UseResources(LoginResource)
  async login(@Body() payload: LoginRequest): Promise<ApiResource> {
    try {
      const response = await this.authService.login(payload);

      return ApiResource.successResponse(response);
    } catch (error) {
      return ApiResource.errorResponse(error);
    }
  }

  @Post('refresh')
  @UseResources(LoginResource)
  async refresh(@Body() payload: RefreshLoginRequest): Promise<ApiResource> {
    try {
      const response = await this.authService.refreshLogin(payload);

      return ApiResource.successResponse(response);
    } catch (error) {
      return ApiResource.errorResponse(error);
    }
  }
}
