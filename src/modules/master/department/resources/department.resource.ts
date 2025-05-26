import { Expose, Type } from 'class-transformer';
import { ResourceDto } from '@resources/paginate.resource';
import { ApiProperty } from '@nestjs/swagger';

export class DepartmentDto {
  @Expose()
  id: number;

  @Expose()
  name: string;
}

export class DepartmentResource extends ResourceDto {
  @Expose()
  @ApiProperty()
  @Type(() => DepartmentDto)
  data: DepartmentDto;
}
