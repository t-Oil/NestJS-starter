import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { OauthRepository } from '@repositories/oauth.repository';
import { LoggerModule } from '@modules/logger/logger.module';
import { MeController } from './controllers/me.controller';
import { UserRepository } from '@repositories/user.repository';
import { AuthController } from './controllers/auth.controller';
import { AuthService } from './services/auth.service';
import { MeService } from './services/me.service';
import { MenuRepository } from '@repositories/menu.repository';

@Module({
  imports: [JwtModule, LoggerModule],
  controllers: [AuthController, MeController],
  providers: [
    AuthService,
    MeService,
    UserRepository,
    OauthRepository,
    MenuRepository
  ],
  exports: [MeService]
})
export class AuthModule {}
