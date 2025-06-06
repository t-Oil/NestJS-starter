import { Injectable } from '@nestjs/common';
import { DataSource, In } from 'typeorm';
import { MenuEntity } from '@entities/menu.entity';
import { ActiveStatusEnum } from '@commons/enums/active-status.enum';
import { UserEntity } from '@entities/user.entity';
import { BaseRepository } from './base.repository';

@Injectable()
export class MenuRepository extends BaseRepository<MenuEntity> {
  constructor(dataSource: DataSource) {
    super(MenuEntity, dataSource.createEntityManager());
  }

  async getMenusInRole(user: UserEntity): Promise<MenuEntity[]> {
    const menuIds: number[] =
      user.roles?.flatMap(
        (role) =>
          role.permissions?.map((permission) => permission.menuId) || [],
      ) || [];

    if (menuIds.length === 0) {
      return [];
    }

    return this.getMenusWithChildren(menuIds);
  }

  private async getMenusWithChildren(ids: number[]): Promise<MenuEntity[]> {
    const [publicMenuIds, parentIds] = await Promise.all([
      this.getPublicMenuIds(),
      this.getParentIds(ids),
    ]);

    const allMenuIds = new Set([...ids, ...publicMenuIds, ...parentIds]);
    const menus = await this.find({
      where: {
        id: In([...allMenuIds]),
        isShow: ActiveStatusEnum.ACTIVE,
        isActive: ActiveStatusEnum.ACTIVE,
      },
      relations: ['parent', 'childrens'],
      order: { ordinalNo: 'ASC' },
    });

    return this.buildMenuHierarchy(menus);
  }

  private async getPublicMenuIds(): Promise<number[]> {
    const publicMenus = await this.find({
      where: { isPublic: ActiveStatusEnum.ACTIVE },
      relations: ['childrens'],
    });

    return this.flattenMenuIds(publicMenus);
  }

  private async getParentIds(ids: number[]): Promise<number[]> {
    const parents = await this.find({
      where: {
        id: In(ids),
        isShow: ActiveStatusEnum.ACTIVE,
      },
      select: ['parentId'],
    });

    return parents
      .map((m) => m.parentId)
      .filter((id): id is number => id !== null);
  }

  private flattenMenuIds(menus: MenuEntity[]): number[] {
    const ids: number[] = [];
    const stack = [...menus];

    while (stack.length) {
      const menu = stack.pop()!;
      ids.push(menu.id);

      if (menu.childrens?.length) {
        stack.push(...menu.childrens);
      }
    }

    return ids;
  }

  private buildMenuHierarchy(menus: MenuEntity[]): MenuEntity[] {
    const menuMap = new Map(menus.map((menu) => [menu.id, menu]));
    const rootMenus: MenuEntity[] = [];

    menus.forEach((menu) => {
      menu.childrens = [];
    });

    for (const menu of menus) {
      if (!menu.parentId) {
        rootMenus.push(menu);
      } else {
        const parent = menuMap.get(menu.parentId);
        if (parent) {
          parent.childrens.push(menu);
        }
      }
    }

    return rootMenus.sort((a, b) => a.ordinalNo - b.ordinalNo);
  }
}
