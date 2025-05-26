import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { OauthRepository } from '@repositories/oauth.repository';
import { MeService } from '@modules/auth/services/me.service';
import { AuthException } from '@exceptions/app/auth.exception';
import { OauthEntity } from '@entities/oauth.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '@commons/decorators/public.decorator';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  private readonly jwtAccessSecret: string;

  constructor(
    @InjectRepository(OauthRepository)
    private readonly oAuthRepository: OauthRepository,
    private readonly meService: MeService,
    private readonly reflector: Reflector,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {
    this.jwtAccessSecret = this.configService.get<string>('jwt.access.secret');
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) return true;

    const request = context.switchToHttp().getRequest();

    try {
      const token: string = this.extractTokenFromHeader(request);
      if (!token) {
        AuthException.Unauthorized(['Missing authorization token']);
      }

      const decoded = await this.jwtService.verifyAsync(token, {
        secret: this.jwtAccessSecret,
      });

      const tokenData: OauthEntity = await this.oAuthRepository.verifyToken(
        decoded.token,
      );

      if (!tokenData) {
        AuthException.Unauthorized(['Invalid or expired token']);
      }

      const user = await this.meService.getMe(tokenData.user);
      if (!user) {
        AuthException.Unauthorized(['User not found']);
      }

      request.user = user;
      request.headers['user-id'] = user.id;

      return true;
    } catch (error) {
      AuthException.Unauthorized();
    }
  }

  private extractTokenFromHeader(request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
