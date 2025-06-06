import { ApiProperty } from '@nestjs/swagger';
import { ResourceDto } from '@resources/paginate.resource';
import { Expose, Type } from 'class-transformer';

export class PermissionDto {
  @Expose({ name: 'uid' })
  @ApiProperty()
  id: string;

  @Expose()
  @ApiProperty()
  isActive: boolean;

  @Expose()
  @ApiProperty()
  value: string;
}

export class PermissionResource extends ResourceDto {
  @Expose()
  @ApiProperty()
  @Type(() => PermissionDto)
  data: PermissionDto;
}
