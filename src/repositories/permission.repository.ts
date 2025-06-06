import { Injectable } from '@nestjs/common';
import { DataSource, In } from 'typeorm';
import { BaseRepository } from '@repositories/base.repository';
import { PermissionEntity } from '@entities/permission.entity';

@Injectable()
export class PermissionRepository extends BaseRepository<PermissionEntity> {
  constructor(dataSource: DataSource) {
    super(PermissionEntity, dataSource.createEntityManager());
  }

  async findByIds(ids: string[]): Promise<PermissionEntity[]> {
    return await this.findBy({
      id: In(ids),
    });
  }
}
