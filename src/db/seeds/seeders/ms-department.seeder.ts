import { DataSource } from 'typeorm';
import { Seeder } from '../seeder.interface';
import { ActiveStatusEnum } from '@commons/enums/active-status.enum';
import { v4 as uuidv4 } from 'uuid';
import { MsDepartmentEntity } from '@entities/ms-department.entity';

export default class MasterDepartmentSeeder implements Seeder {
  public async run(
    dataSource: DataSource,
    createdById?: number,
  ): Promise<void> {
    const repository = dataSource.getRepository(MsDepartmentEntity);

    const count = await repository.count();
    if (count > 0) {
      console.log(
        `${MasterDepartmentSeeder.name} already exists, skipping seed`,
      );
      return;
    }

    const created = [
      {
        uid: uuidv4(),
        name: 'Strategy',
        createdById: createdById,
        updatedById: createdById,
        isActive: ActiveStatusEnum.ACTIVE,
      },
      {
        uid: uuidv4(),
        name: 'Brand',
        createdById: createdById,
        updatedById: createdById,
        isActive: ActiveStatusEnum.ACTIVE,
      },
      {
        uid: uuidv4(),
        name: 'Design',
        createdById: createdById,
        updatedById: createdById,
        isActive: ActiveStatusEnum.ACTIVE,
      },
      {
        uid: uuidv4(),
        name: 'Marketing',
        createdById: createdById,
        updatedById: createdById,
        isActive: ActiveStatusEnum.ACTIVE,
      },
      {
        uid: uuidv4(),
        name: 'Sustainability',
        createdById: createdById,
        updatedById: createdById,
        isActive: ActiveStatusEnum.ACTIVE,
      },
      {
        uid: uuidv4(),
        name: 'Innovation',
        createdById: createdById,
        updatedById: createdById,
        isActive: ActiveStatusEnum.ACTIVE,
      },
      {
        uid: uuidv4(),
        name: 'Technology',
        createdById: createdById,
        updatedById: createdById,
        isActive: ActiveStatusEnum.ACTIVE,
      },
      {
        uid: uuidv4(),
        name: 'Communications',
        createdById: createdById,
        updatedById: createdById,
        isActive: ActiveStatusEnum.ACTIVE,
      },
      {
        uid: uuidv4(),
        name: 'Project Management',
        createdById: createdById,
        updatedById: createdById,
        isActive: ActiveStatusEnum.ACTIVE,
      },
      {
        uid: uuidv4(),
        name: 'New Business',
        createdById: createdById,
        updatedById: createdById,
        isActive: ActiveStatusEnum.ACTIVE,
      },
      {
        uid: uuidv4(),
        name: 'Operations',
        createdById: createdById,
        updatedById: createdById,
        isActive: ActiveStatusEnum.ACTIVE,
      },
      {
        uid: uuidv4(),
        name: 'People & Culture',
        createdById: createdById,
        updatedById: createdById,
        isActive: ActiveStatusEnum.ACTIVE,
      },
      {
        uid: uuidv4(),
        name: 'Finance & Admin',
        createdById: createdById,
        updatedById: createdById,
        isActive: ActiveStatusEnum.ACTIVE,
      },
    ];

    await repository.insert(created);
    console.log(`${MasterDepartmentSeeder.name} seeded successfully`);
  }
}
