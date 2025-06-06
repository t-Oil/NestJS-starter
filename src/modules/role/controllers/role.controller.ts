import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { RoleService } from '../services/role.service';
import { PaginateQuery } from '@commons/requests/paginate.dto';
import { ApiResource } from '@commons/responses/api-resource';
import { UseResources } from '@interceptors/use-resources.interceptor';
import { RoleResource } from '../resources/role.resource';
import { UpdateResourceDto } from '@resources/update.resource';
import { CreateRoleRequest } from '../requests/create-role.request';
import { UpdateRoleRequest } from '../requests/update-role.request';
import { Roles } from '@commons/decorators/permissions.decorator';
import { UserPermission } from '@commons/enums/user/permission.enum';
import { RolesGuard } from '@commons/guards/role.guard';

@Controller('roles')
@UseGuards(RolesGuard)
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  @Get()
  @Roles(UserPermission.USER_ROLE_READ)
  @UseResources(RoleResource)
  async get(
    @Query('textSearch') textSearch: string,
    @Query() { page, limit, sortColumn, sortDirection }: PaginateQuery,
    @Query('includes') includes: string,
    @Query('status') status?: boolean,
  ): Promise<ApiResource> {
    try {
      const conditions: { [key: string]: any } = {};
      if (status !== undefined) conditions.isActive = +status;

      const response = await this.roleService.paginate(
        textSearch,
        {
          page,
          limit,
        },
        sortColumn,
        sortDirection,
        includes,
        conditions,
      );

      return ApiResource.successResponse(response);
    } catch (error) {
      return ApiResource.errorResponse(error);
    }
  }

  @Get('permissions')
  @Roles(UserPermission.USER_ROLE_READ)
  async getPermissions(): Promise<ApiResource> {
    try {
      const response = await this.roleService.getPermissions();

      return ApiResource.successResponse(response);
    } catch (error) {
      return ApiResource.errorResponse(error);
    }
  }

  @Get(':uid')
  @Roles(UserPermission.USER_ROLE_READ)
  @UseResources(RoleResource)
  async getById(
    @Param('uid', new ParseUUIDPipe({ version: '4' })) uid: string,
    @Query('includes') includes: string,
  ): Promise<ApiResource> {
    try {
      const response = await this.roleService.getById(uid, includes);

      return ApiResource.successResponse(response);
    } catch (error) {
      return ApiResource.errorResponse(error);
    }
  }

  @Delete(':uid')
  @Roles(UserPermission.USER_ROLE_DELETE)
  @UseResources(UpdateResourceDto)
  async delete(
    @Param('uid', new ParseUUIDPipe({ version: '4' })) uid: string,
  ): Promise<ApiResource> {
    try {
      const response = await this.roleService.delete(uid);

      return ApiResource.successResponse(response);
    } catch (error) {
      return ApiResource.errorResponse(error);
    }
  }

  @Post()
  @Roles(UserPermission.USER_ROLE_CREATE)
  @UseResources(RoleResource)
  async createRole(
    @Body() roleRequest: CreateRoleRequest,
  ): Promise<ApiResource> {
    try {
      const response = await this.roleService.create(roleRequest);

      return ApiResource.successResponse(response);
    } catch (error) {
      return ApiResource.errorResponse(error);
    }
  }

  @Put(':uid')
  @Roles(UserPermission.USER_ROLE_UPDATE)
  async updateRole(
    @Param('uid', new ParseUUIDPipe({ version: '4' })) uid: string,
    @Body() roleRequest: UpdateRoleRequest,
  ): Promise<ApiResource> {
    try {
      const response = await this.roleService.update(uid, roleRequest);

      return ApiResource.successResponse(response);
    } catch (error) {
      return ApiResource.errorResponse(error);
    }
  }
}
