import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from '@nestjs/typeorm';
import { SeederOptions } from 'typeorm-extension';

@Injectable()
class TypeOrmConfigService implements TypeOrmOptionsFactory {
  constructor(private configService: ConfigService) {}
  createTypeOrmOptions(): TypeOrmModuleOptions & SeederOptions {
    const isTesting = this.configService.get<string>('mode') === 'test';

    let defaultOptions: TypeOrmModuleOptions & SeederOptions = {
      type: this.configService.get<string>('database.type') as 'postgres',
      host: this.configService.get<string>('database.host'),
      port: this.configService.get<number>('database.port'),
      username: this.configService.get<string>('database.username'),
      password: this.configService.get<string>('database.password'),
      database: this.configService.get<string>('database.name'),
      entities: [__dirname + './../../entities/*.entity{.ts,.js}'],
      synchronize: this.configService.get<boolean>('database.sync'),
      dropSchema: this.configService.get<boolean>('database.dropSchema'),
      factories: ['src/db/factories/**/*{.ts,.js}'],
    };
    if (isTesting) {
      defaultOptions = {
        ...defaultOptions,
        database: this.configService.get<string>('database.name'),
        synchronize: this.configService.get<boolean>('database.sync'),
      };
    }
    return defaultOptions;
  }
}
export default TypeOrmConfigService;
