import { DataSource } from 'typeorm';
import { Seeder } from '../seeder.interface';
import { ActiveStatusEnum } from '@commons/enums/active-status.enum';
import { MenuEntity } from '@entities/menu.entity';
import { v4 as uuidv4 } from 'uuid';

export default class MenuSeeder implements Seeder {
  public async run(
    dataSource: DataSource,
    createdById?: number,
  ): Promise<MenuEntity[]> {
    const repository = dataSource.getRepository(MenuEntity);

    const count = await repository.count();
    if (count > 0) {
      console.log('Menus already exist, fetching existing menus');
      return await repository.find();
    }

    const parentMenus = [
      {
        uid: uuidv4(),
        name: 'Dashboard',
        routeUrl: '/admin/dashboards/analytic',
        parentId: null,
        ordinal: 1,
        isShow: ActiveStatusEnum.ACTIVE,
        createdById: createdById,
        createdDate: new Date(),
      },
      {
        uid: uuidv4(),
        name: 'User Management',
        routeUrl: '/',
        parentId: null,
        ordinal: 2,
        isShow: ActiveStatusEnum.ACTIVE,
        createdById: createdById,
        createdDate: new Date(),
      },
    ];

    const savedParentMenus = await repository.save(parentMenus);
    console.log('Parent menus seeded successfully');

    const parentMenuMap = savedParentMenus.reduce((map, menu) => {
      map[menu.name] = menu;
      return map;
    }, {});

    const childMenus = [
      {
        uid: uuidv4(),
        name: 'User',
        routeUrl: '/admin/users',
        parentId: parentMenuMap['User Management'].id,
        ordinal: 1,
        isShow: ActiveStatusEnum.ACTIVE,
        createdById: createdById,
        createdDate: new Date(),
      },
      {
        uid: uuidv4(),
        name: 'Create User',
        routeUrl: '/admin/users/create',
        parentId: parentMenuMap['User Management'].id,
        ordinal: 1,
        isShow: ActiveStatusEnum.IN_ACTIVE,
        createdById: createdById,
        createdDate: new Date(),
      },
      {
        uid: uuidv4(),
        name: 'View User',
        routeUrl: '/admin/users/:id/view',
        parentId: parentMenuMap['User Management'].id,
        ordinal: 1,
        isShow: ActiveStatusEnum.IN_ACTIVE,
        createdById: createdById,
        createdDate: new Date(),
      },
      {
        uid: uuidv4(),
        name: 'Update User',
        routeUrl: '/admin/users/:id',
        parentId: parentMenuMap['User Management'].id,
        ordinal: 1,
        isShow: ActiveStatusEnum.IN_ACTIVE,
        createdById: createdById,
        createdDate: new Date(),
      },
      {
        uid: uuidv4(),
        name: 'Delete User',
        routeUrl: '/admin/users/:id/delete',
        parentId: parentMenuMap['User Management'].id,
        ordinal: 1,
        isShow: ActiveStatusEnum.IN_ACTIVE,
        createdById: createdById,
        createdDate: new Date(),
      },
      {
        uid: uuidv4(),
        name: 'Role',
        routeUrl: '/admin/roles',
        parentId: parentMenuMap['User Management'].id,
        ordinal: 2,
        isShow: ActiveStatusEnum.ACTIVE,
        createdById: createdById,
        createdDate: new Date(),
      },
      {
        uid: uuidv4(),
        name: 'Create Role',
        routeUrl: '/admin/roles/create',
        parentId: parentMenuMap['User Management'].id,
        ordinal: 2,
        isShow: ActiveStatusEnum.IN_ACTIVE,
        createdById: createdById,
        createdDate: new Date(),
      },
      {
        uid: uuidv4(),
        name: 'View Role',
        routeUrl: '/admin/roles/:id/view',
        parentId: parentMenuMap['User Management'].id,
        ordinal: 2,
        isShow: ActiveStatusEnum.IN_ACTIVE,
        createdById: createdById,
        createdDate: new Date(),
      },
      {
        uid: uuidv4(),
        name: 'Update Role',
        routeUrl: '/admin/roles/:roleId',
        parentId: parentMenuMap['User Management'].id,
        ordinal: 2,
        isShow: ActiveStatusEnum.IN_ACTIVE,
        createdById: createdById,
        createdDate: new Date(),
      },
      {
        uid: uuidv4(),
        name: 'Delete Role',
        routeUrl: '/admin/roles/:roleId/delete',
        parentId: parentMenuMap['User Management'].id,
        ordinal: 2,
        isShow: ActiveStatusEnum.IN_ACTIVE,
        createdById: createdById,
        createdDate: new Date(),
      },
    ];

    const savedChildMenus = await repository.save(childMenus);
    console.log('Child menus seeded successfully');

    return [...savedParentMenus, ...savedChildMenus];
  }
}
