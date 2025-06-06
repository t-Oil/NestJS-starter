import { DataSource } from 'typeorm';
import { Seeder } from '../seeder.interface';
import { ActiveStatusEnum } from '@commons/enums/active-status.enum';
import { v4 as uuidv4 } from 'uuid';
import { RoleEntity } from '@entities/role.entity';

export default class RoleSeeder implements Seeder {
  public async run(
    dataSource: DataSource,
    createdById?: number,
  ): Promise<void> {
    const repository = dataSource.getRepository(RoleEntity);

    const count = await repository.count();
    if (count > 0) {
      console.log(`${RoleSeeder.name} already exists, skipping seed`);
      return;
    }

    const created = [
      {
        uid: uuidv4(),
        name: 'admin',
        createdById: createdById,
        updatedById: createdById,
        isActive: ActiveStatusEnum.ACTIVE,
        isDefault: false,
        isCanDelete: false,
      },
      {
        uid: uuidv4(),
        name: 'user',
        createdById: createdById,
        updatedById: createdById,
        isActive: ActiveStatusEnum.ACTIVE,
        isDefault: true,
        isCanDelete: false,
      },
    ];

    await repository.insert(created);
    console.log(`${RoleSeeder.name} seeded successfully`);
  }
}
