import { Injectable } from '@nestjs/common';
import { BaseRepository } from '@repositories/base.repository';
import { DataSource } from 'typeorm';
import { MsDepartmentEntity } from "@entities/ms-department.entity";

@Injectable()
export class DepartmentRepository extends BaseRepository<MsDepartmentEntity> {
  constructor(private dataSource: DataSource) {
    super(MsDepartmentEntity, dataSource.createEntityManager());
  }
}
