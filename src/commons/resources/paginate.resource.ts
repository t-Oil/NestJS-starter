import { Expose } from 'class-transformer';
import { IPaginationMeta, IPaginationLinks } from 'nestjs-typeorm-paginate';

export class ResourceDto {
  @Expose()
  status: {
    code: number;
    message: string;
  };
}

export class ResourceWithPaginateDto extends ResourceDto{
  @Expose()
  meta: IPaginationMeta;

  @Expose()
  links: IPaginationLinks;
}
