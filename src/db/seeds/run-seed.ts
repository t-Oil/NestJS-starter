import { NestFactory } from '@nestjs/core';
import { DataSource } from 'typeorm';
import { AppModule } from '@modules/app/app.module';
import SystemAdminSeeder from "./seeders/system-admin.seeder";
import MasterDepartmentSeeder from "./seeders/ms-department.seeder";
import { UserEntity } from '@entities/user.entity';
import { MenuEntity } from '@entities/menu.entity';
import MenuSeeder from './seeders/menu.seeder';
import PermissionSeeder from './seeders/permission.seeder';
import RoleSeeder from './seeders/role.seeder';

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
    console.log('Running Menu seeder...');
    const menu = new MenuSeeder();
    const menuData: MenuEntity[] = await menu.run(dataSource, createdById);
    //
    console.log('Running Role seeder...');
    const role = new RoleSeeder();
    await role.run(dataSource, createdById);

    console.log('Running Permission seeder...');
    const permission = new PermissionSeeder();
    await permission.run(dataSource, menuData, createdById);
    console.log('All seeds completed successfully');
  } catch (error) {
    console.error('Error during seed execution:', error);
  } finally {
    await app.close();
  }
}

bootstrap();
