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
} from '@nestjs/common';
import { UserService } from '@modules/user/services/user.service';
import { PaginateQuery } from '@commons/requests/paginate.dto';
import { ApiResource } from '@commons/responses/api-resource';
import { UserResource } from '@modules/user/resources/user.resource';
import { UseResources } from '@interceptors/use-resources.interceptor';
import { CreateUserRequestDto } from '../requests/create-user.request';
import { UpdateUserRequestDto } from '../requests/update-user.request';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  @UseResources(UserResource)
  async get(
    @Query('textSearch') textSearch: string,
    @Query() { page, limit, sortColumn, sortDirection }: PaginateQuery,
    @Query('includes') includes: string,
  ): Promise<ApiResource> {
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
      );

      return ApiResource.successResponse(response);
    } catch (error) {
      return ApiResource.errorResponse(error);
    }
  }

  @Get(':uid')
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
