import { ForbiddenException, Injectable } from '@nestjs/common';
import { compare } from 'bcryptjs';
import { AuthException } from '@exceptions/app/auth.exception';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { OauthRepository } from '@repositories/oauth.repository';
import { OauthEntity } from '@entities/oauth.entity';
import { Logger } from '@modules/logger/services/logger.service';
import { InjectRepository } from '@nestjs/typeorm';
import { UserRepository } from '@repositories/user.repository';
import { UserEntity } from '@entities/user.entity';
import { IGenerateToken } from '../interfaces/generate-token.interface';
import { LoginRequest } from '../requests/login.request';
import { RefreshLoginRequest } from '../requests/refresh-login.request';

@Injectable()
export class AuthService {
  private readonly jwtAccessSecret: string;
  private readonly jwtAccessExpire: string;
  private readonly jwtRefreshSecret: string;
  private readonly jwtRefreshExpire: string;

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    @InjectRepository(UserRepository)
    private readonly userRepository: UserRepository,
    @InjectRepository(OauthRepository)
    private readonly oauthRepository: OauthRepository,
    private readonly logger: Logger,
  ) {
    this.jwtAccessSecret = this.configService.get<string>('jwt.access.secret');
    this.jwtAccessExpire = this.configService.get<string>('jwt.access.expire');
    this.jwtRefreshSecret =
      this.configService.get<string>('jwt.refresh.secret');
    this.jwtRefreshExpire =
      this.configService.get<string>('jwt.refresh.expire');
  }

  async login(payload: LoginRequest): Promise<IGenerateToken> {
    try {
      const { username, password } = payload;

      const user: UserEntity =
        await this.userRepository.findOneWithActive({
          where: {
            email: username,
          },
        });

        console.log('user', user);
        

      const comparePassword: boolean = await compare(
        password,
        user.password,
      );

      if (!user || !comparePassword) {
        throw new Error('Unauthorized');
      }

      return await this.generateToken(user.id);
    } catch (error) {
      this.logger.error(`${AuthService.name}[LOGIN]`, {
        errors: {
          username: payload.username,
          message: error.message,
        },
      })
      throw AuthException.Unauthorized();
    }
  }

  private async generateToken(userId: number): Promise<IGenerateToken> {
    const oAuth: OauthEntity = await this.oauthRepository.store(userId);

    return {
      accessToken: this.jwtService.sign(
        { token: oAuth.token },
        { expiresIn: this.jwtAccessExpire, secret: this.jwtAccessSecret },
      ),
      refreshToken: this.jwtService.sign(
        { token: oAuth.refreshToken },
        { expiresIn: this.jwtRefreshExpire, secret: this.jwtRefreshSecret },
      ),
    };
  }

  async refreshLogin(payload: RefreshLoginRequest): Promise<IGenerateToken> {
    try {
      const { refreshToken } = payload;

      const decoded = await this.jwtService.verifyAsync(refreshToken, {
        secret: this.jwtRefreshSecret,
      });

      const oAuth: OauthEntity = await this.oauthRepository.findOneOrFail({
        where: {
          refreshToken: decoded.token,
        },
      });

      return await this.generateToken(oAuth.user);
    } catch (error) {
      throw new ForbiddenException('Invalid refresh token');
    }
  }
}
