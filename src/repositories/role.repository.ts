import { Injectable } from '@nestjs/common';
import { DataSource, In } from 'typeorm';
import { BaseRepository } from '@repositories/base.repository';
import { RoleEntity } from '@entities/role.entity';

@Injectable()
export class RoleRepository extends BaseRepository<RoleEntity> {
  constructor(dataSource: DataSource) {
    super(RoleEntity, dataSource.createEntityManager());
  }

  async findByIds(ids: string[]): Promise<RoleEntity[]> {
    return await this.findBy({
      id: In(ids),
    });
  }
}
