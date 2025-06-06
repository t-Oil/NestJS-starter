import { ActiveStatusEnum } from '@commons/enums/active-status.enum';
import { RoleEntity } from '@entities/role.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { RoleRepository } from '@repositories/role.repository';
import { IPaginationOptions, Pagination } from 'nestjs-typeorm-paginate';
import { In, UpdateResult } from 'typeorm';
import { CreateRoleRequest } from '../requests/create-role.request';
import { PermissionRepository } from '@repositories/permission.repository';
import { UpdateRoleRequest } from '../requests/update-role.request';
import { PermissionEntity } from '@entities/permission.entity';
import { RoleException } from '@exceptions/app/role.exception';

@Injectable()
export class RoleService {
  constructor(
    @InjectRepository(RoleRepository)
    private readonly roleRepository: RoleRepository,
    @InjectRepository(PermissionRepository)
    private readonly permissionRepository: PermissionRepository,
  ) {}

  async paginate(
    textSearch = '',
    options: IPaginationOptions,
    sortColumn: string = 'updatedAt',
    sortDirection: 'ASC' | 'DESC' = 'DESC',
    includes?: string,
    conditions?: { [key: string]: any },
  ): Promise<Pagination<RoleEntity>> {
    return await this.roleRepository.paginate(
      options,
      sortColumn,
      sortDirection,
      textSearch,
      ['name'],
      includes?.split(','),
      conditions,
    );
  }

  async getById(uid: string, includes?: string): Promise<RoleEntity> {
    try {
      return await this.roleRepository.findOneOrFail({
        relations: includes?.split(','),
        where: {
          uid,
          isActive: ActiveStatusEnum.ACTIVE,
        },
      });
    } catch (error) {
      throw RoleException.notFound();
    }
  }

  async delete(uid: string): Promise<UpdateResult> {
    try {
      const role = await this.getById(uid);
      role.isActive = ActiveStatusEnum.IN_ACTIVE;

      return await this.roleRepository.update(role.id, {
        isActive: ActiveStatusEnum.IN_ACTIVE,
        deletedAt: new Date(),
      });
    } catch (error) {
      throw RoleException.notFound();
    }
  }

  async create(payload: CreateRoleRequest): Promise<RoleEntity> {
    try {
      const permissions = await this.permissionRepository.findBy({
        uid: In(payload.permissions),
        isActive: ActiveStatusEnum.ACTIVE,
      });

      const role = this.roleRepository.create({
        name: payload.name,
        description: payload.description,
        permissions,
        createdById: payload.createdBy,
        updatedById: payload.createdBy,
        isActive: ActiveStatusEnum.ACTIVE,
      });

      return this.roleRepository.save(role);
    } catch (error) {
      console.log(error);
      throw RoleException.createError();
    }
  }

  async update(uid: string, payload: UpdateRoleRequest): Promise<RoleEntity> {
    try {
      const role = await this.getById(uid, 'permissions');

      role.name = payload.name;
      role.description = payload.description;
      role.permissions = await this.permissionRepository.findBy({
        uid: In(payload.permissions),
        isActive: ActiveStatusEnum.ACTIVE,
      });
      role.updatedById = payload.updatedBy;

      return await this.roleRepository.save(role);
    } catch (error) {
      throw RoleException.notFound();
    }
  }

  async getPermissions(): Promise<any> {
    const permissions = await this.permissionRepository.find({
      where: {
        isActive: ActiveStatusEnum.ACTIVE,
      },
    });

    return this.transformPermissions(permissions);
  }

  private transformPermissions = (permissions: PermissionEntity[]) => {
    const groupedMap: {
      [key: string]: {
        name: string;
        read: { id: string | false; value: boolean };
        create: { id: string | false; value: boolean };
        update: { id: string | false; value: boolean };
        delete: { id: string | false; value: boolean };
      };
    } = {};

    permissions.forEach((permission) => {
      const parts = permission.value.split('.');
      const action = parts.pop();
      const resource = parts.join('.');

      if (!groupedMap[resource]) {
        groupedMap[resource] = {
          name: resource,
          read: { id: false, value: false },
          create: { id: false, value: false },
          update: { id: false, value: false },
          delete: { id: false, value: false },
        };
      }

      if (action && ['read', 'create', 'update', 'delete'].includes(action)) {
        const actionKey = action as 'read' | 'create' | 'update' | 'delete';
        groupedMap[resource][actionKey] = {
          id: permission.uid,
          value: permission.isActive === ActiveStatusEnum.ACTIVE,
        };
      }
    });

    return Object.values(groupedMap);
  };
}
