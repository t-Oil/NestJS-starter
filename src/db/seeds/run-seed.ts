import { NestFactory } from '@nestjs/core';
import { DataSource } from 'typeorm';
import { AppModule } from '@modules/app/app.module';
import SystemAdminSeeder from "./seeders/system-admin.seeder";
import MasterDepartmentSeeder from "./seeders/ms-department.seeder";
import { UserEntity } from '@entities/user.entity';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);

  try {
    const dataSource = app.get(DataSource);

    console.log('Running seeder...');
    const userSeeder = new SystemAdminSeeder();
    const users: UserEntity[] = await userSeeder.run(dataSource);

    const adminUser =
      users.find((user) => user.email === 'system@brandi.com') || users[0];
    const createdById = adminUser?.id;
    // await new ExampleSeeder().run(dataSource, createdById)
    console.log('Running Master Department seeder...');
    const msDepartment = new MasterDepartmentSeeder();
    await msDepartment.run(dataSource, createdById);
    //
    console.log('All seeds completed successfully');
  } catch (error) {
    console.error('Error during seed execution:', error);
  } finally {
    await app.close();
  }
}

bootstrap();
