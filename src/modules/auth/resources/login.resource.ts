import { Expose, Type } from 'class-transformer';
import { ResourceDto } from '@resources/paginate.resource';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @Expose()
  accessToken: string;

  @Expose()
  refreshToken: string;
}

export class LoginResource extends ResourceDto {
  @Expose()
  @ApiProperty()
  @Type(() => LoginDto)
  data: LoginDto;
}
