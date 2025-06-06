import { ApiProperty } from '@nestjs/swagger';
import { ResourceWithPaginateDto } from '@resources/paginate.resource';
import { Expose, Type } from 'class-transformer';
import { BaseResourceDto } from '@resources/base.resource';
import { PermissionDto } from './permission.resource';

export class RoleDto extends BaseResourceDto {
  @Expose()
  @ApiProperty()
  name: string;

  @Expose()
  @ApiProperty()
  description: string;

  @Expose()
  @ApiProperty()
  isDefault: boolean;

  @Expose()
  @ApiProperty()
  @Type(() => PermissionDto)
  permissions?: PermissionDto[];

  @Expose()
  @ApiProperty()
  isCanDelete: boolean;
}

export class RoleResource extends ResourceWithPaginateDto {
  @Expose()
  @ApiProperty()
  @Type(() => RoleDto)
  data: RoleDto;
}
