import { DataSource } from 'typeorm';
import { Seeder } from '../seeder.interface';
import { hashSync } from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { ActiveStatusEnum } from "@commons/enums/active-status.enum";
import { UserEntity } from '@entities/user.entity';

export default class SystemAdminSeeder implements Seeder {
  public async run(dataSource: DataSource): Promise<UserEntity[]> {
    const repository = dataSource.getRepository(UserEntity);

    const count = await repository.count({
      where: {
        email: 'system@mock.com',
      },
    });

    if (count > 0) {
      console.log('Users already exist, fetching existing users');
      return await repository.find();
    }

    const users = [
      {
        uid: uuidv4(),
        email: 'system@mock.com',
        password: hashSync('a!BrandI2*(1', 10),
        firstName: "System",
        lastName: "Admin",
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
        isActive: ActiveStatusEnum.IN_ACTIVE
      }
    ];

    const savedUsers = await repository.save(users);
    console.log('Users seeded successfully');
    return savedUsers;
  }
}
