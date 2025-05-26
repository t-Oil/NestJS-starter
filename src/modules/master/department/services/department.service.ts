import { Injectable } from '@nestjs/common';
import { SelectQueryBuilder } from 'typeorm';
import { DepartmentRepository } from '@repositories/department.repository';
import { MsDepartmentEntity } from '@entities/ms-department.entity';

@Injectable()
export class DepartmentService {
  constructor(private readonly departmentRepository: DepartmentRepository) {}

  async findAll(textSearch: string): Promise<MsDepartmentEntity[]> {
    const queryBuilder: SelectQueryBuilder<MsDepartmentEntity> = this.departmentRepository.createQueryBuilder('department');

    if (textSearch) {
      queryBuilder.where(
        `CONCAT(department.name) like :textSearch`,
        {
          textSearch: `%${textSearch.toLowerCase()}%`,
        },
      );
    }

    return await queryBuilder.orderBy('department.name', 'ASC').getMany();
  }
}
