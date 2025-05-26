import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { ResourceDto } from './paginate.resource';

export class UpdateDto {
  @Expose()
  affected: number;
}

export class UpdateResourceDto extends ResourceDto {
  @Expose()
  @ApiProperty()
  @Type(() => UpdateDto)
  data: UpdateDto;
}
