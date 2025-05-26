import { ResourceDto } from '@resources/paginate.resource';
import { Expose, Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { BaseResourceDto } from '@resources/base.resource';

export class MeDto extends BaseResourceDto {
  @Expose()
  @ApiProperty()
  firstName: string;

  @Expose()
  @ApiProperty()
  lastName: string;
}

export class MeResource extends ResourceDto {
  @Expose()
  @ApiProperty()
  @Type(() => MeDto)
  data: MeDto;
}
