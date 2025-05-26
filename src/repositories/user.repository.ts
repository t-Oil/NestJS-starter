import { UserEntity } from '@entities/user.entity';
import { Injectable } from '@nestjs/common';
import { BaseRepository } from '@repositories/base.repository';
import { DataSource } from 'typeorm';

@Injectable()
export class UserRepository extends BaseRepository<UserEntity> {
  constructor(private dataSource: DataSource) {
    super(UserEntity, dataSource.createEntityManager());
  }
}
