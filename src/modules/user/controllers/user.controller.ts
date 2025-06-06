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
import { UserService } from '@modules/user/services/user.service';
import { PaginateQuery } from '@commons/requests/paginate.dto';
import { ApiResource } from '@commons/responses/api-resource';
import { UserResource } from '@modules/user/resources/user.resource';
import { UseResources } from '@interceptors/use-resources.interceptor';
import { CreateUserRequestDto } from '../requests/create-user.request';
import { UpdateUserRequestDto } from '../requests/update-user.request';
import { RolesGuard } from '@commons/guards/role.guard';
import { UserPermission } from '@commons/enums/user/permission.enum';
import { Roles } from '@commons/decorators/permissions.decorator';
import { UpdateResourceDto } from '@resources/update.resource';

@Controller('users')
@UseGuards(RolesGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  @Roles(UserPermission.USER_READ)
  @UseResources(UserResource)
  async get(
    @Query('textSearch') textSearch: string,
    @Query() { page, limit, sortColumn, sortDirection }: PaginateQuery,
    @Query('includes') includes: string,
    @Query('status') status?: boolean,
  ): Promise<ApiResource> {
    const conditions: { [key: string]: any } = {};
    if (status !== undefined) conditions.isActive = +status;

    try {
      const response = await this.userService.paginate(
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

  @Get(':uid')
  @Roles(UserPermission.USER_READ)
  @UseResources(UserResource)
  async getById(
    @Param('uid', new ParseUUIDPipe({ version: '4' })) uid: string,
    @Query('includes') includes: string,
  ): Promise<ApiResource> {
    try {
      const response = await this.userService.getById(uid, includes);

      return ApiResource.successResponse(response);
    } catch (error) {
      return ApiResource.errorResponse(error);
    }
  }

  @Post()
  @Roles(UserPermission.USER_CREATE)
  @UseResources(UserResource)
  async create(
    @Body() createUserRequest: CreateUserRequestDto,
  ): Promise<ApiResource> {
    try {
      const response = await this.userService.create(createUserRequest);

      return ApiResource.successResponse(response);
    } catch (error) {
      return ApiResource.errorResponse(error);
    }
  }

  @Delete(':uid')
  @Roles(UserPermission.USER_DELETE)
  @UseResources(UpdateResourceDto)
  async delete(
    @Param('uid', new ParseUUIDPipe({ version: '4' })) uid: string,
  ): Promise<ApiResource> {
    try {
      const response = await this.userService.delete(uid);

      return ApiResource.successResponse(response);
    } catch (error) {
      return ApiResource.errorResponse(error);
    }
  }

  @Put(':uid')
  @Roles(UserPermission.USER_UPDATE)
  @UseResources(UserResource)
  async update(
    @Param('uid', new ParseUUIDPipe({ version: '4' })) uid: string,
    @Body() updateUserRequest: UpdateUserRequestDto,
  ): Promise<ApiResource> {
    try {
      const response = await this.userService.update(uid, updateUserRequest);

      return ApiResource.successResponse(response);
    } catch (error) {
      return ApiResource.errorResponse(error);
    }
  }
}
