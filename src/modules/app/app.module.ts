import { Module } from '@nestjs/common';
import configuration from '@configs/configuration';
import { TypeOrmModule } from '@nestjs/typeorm';
import TypeOrmConfigService from '@configs/typeorm/default';
import { DataSource } from 'typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { ExceptionFilter } from '@exceptions/exception.filter';
import { JwtModule } from '@nestjs/jwt';
import { LoggerModule } from '@modules/logger/logger.module';
import { CacheModule } from '@nestjs/cache-manager';
import { JwtAuthGuard } from '@commons/guards/jwt-auth.guard';
import { OauthRepository } from '@repositories/oauth.repository';
import { AuthModule } from '@modules/auth/auth.module';
import { UserRepository } from '@repositories/user.repository';
import { MeService } from '@modules/auth/services/me.service';
import { MasterModule } from '@modules/master/master.module';
import { UserModule } from '@modules/user/user.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [configuration],
      envFilePath: '.env',
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      useClass: TypeOrmConfigService,
      dataSourceFactory: async (options) => {
        return await new DataSource(options).initialize();
      },
    }),
    CacheModule.register({
      isGlobal: true,
      ttl: 5000,
    }),
    JwtModule,
    LoggerModule,
    AuthModule,
    MasterModule,
    UserModule
  ],
  controllers: [AppController],
  providers: [
    {
      provide: APP_FILTER,
      useClass: ExceptionFilter,
    },
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    AppService,
    MeService,
    OauthRepository,
    UserRepository,
  ],
})
export class AppModule {}
