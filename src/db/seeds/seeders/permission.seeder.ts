import { DataSource } from 'typeorm';
import { Seeder } from '../seeder.interface';
import { MenuEntity } from '@entities/menu.entity';
import { PermissionEntity } from '@entities/permission.entity';
import { ActiveStatusEnum } from '@commons/enums/active-status.enum';
import { v4 as uuidv4 } from 'uuid';
import { UserPermission } from '@commons/enums/user/permission.enum';

export default class PermissionSeeder implements Seeder {
  public async run(
    dataSource: DataSource,
    menus: MenuEntity[],
    createdById: number,
  ): Promise<void> {
    const permissionRepository = dataSource.getRepository(PermissionEntity);

    const count = await permissionRepository.count();
    if (count > 0) {
      console.log('Permissions already exist, skipping seed');
      return;
    }

    const menuByRoute = new Map<string, MenuEntity>();
    menus.forEach((menu) => {
      menuByRoute.set(menu.routeUrl, menu);
    });

    const permissionMenuMappings = [
      { permission: UserPermission.USER_READ, route: '/admin/users' },
      { permission: UserPermission.USER_CREATE, route: '/admin/users/create' },
      { permission: UserPermission.USER_UPDATE, route: '/admin/users/:id' },
      {
        permission: UserPermission.USER_DELETE,
        route: '/admin/users/:id/delete',
      },
      { permission: UserPermission.USER_ROLE_READ, route: '/admin/roles' },
      {
        permission: UserPermission.USER_ROLE_CREATE,
        route: '/admin/roles/create',
      },
      {
        permission: UserPermission.USER_ROLE_UPDATE,
        route: '/admin/roles/:roleId',
      },
      {
        permission: UserPermission.USER_ROLE_DELETE,
        route: '/admin/roles/:roleId/delete',
      },
      // Add more mappings as needed
    ];

    const queryRunner = dataSource.createQueryRunner();
    await queryRunner.connect();

    try {
      await queryRunner.startTransaction();

      for (const mapping of permissionMenuMappings) {
        const menu = menuByRoute.get(mapping.route);

        if (!menu) {
          console.warn(`Menu "${mapping.route}" not found, skipping`);
          continue;
        }

        const permission = new PermissionEntity();
        permission.uid = uuidv4();
        permission.value = mapping.permission;
        permission.menuId = menu.id;
        permission.isActive = ActiveStatusEnum.ACTIVE;
        permission.createdById = createdById;
        permission.createdAt = new Date();
        permission.updatedById = createdById;
        permission.updatedAt = new Date();

        await queryRunner.manager.save(permission);
      }

      await queryRunner.commitTransaction();
      console.log('Permissions seeded successfully');
    } catch (error) {
      await queryRunner.rollbackTransaction();
      console.error('Error seeding permissions:', error);
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}
