import { DepartmentDto } from '@modules/master/department/resources/department.resource';
import { BaseResourceDto } from '@resources/base.resource';
import { ResourceWithPaginateDto } from '@resources/paginate.resource';
import { Expose, Type } from 'class-transformer';

export class UserDto extends BaseResourceDto {
  @Expose()
  email: string;

  @Expose()
  firstName: string;

  @Expose()
  lastName: string;

  @Expose()
  @Type(() => DepartmentDto)
  department: DepartmentDto
}

export class UserResource extends ResourceWithPaginateDto {
  @Expose()
  @Type(() => UserDto)
  data: UserDto;
}
