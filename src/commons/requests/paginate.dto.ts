import { ConfigService } from '@nestjs/config';
import { Expose, Transform } from 'class-transformer';
import { IsNumber, IsOptional, IsString } from 'class-validator';
import { defaultTo } from 'lodash';

const configService = new ConfigService();

export class PaginateQuery {
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  page: number;

  @IsOptional()
  @Transform(({ value }) =>
    parseInt(defaultTo(value, configService.get<number>('PER_PAGE'))),
  )
  @Expose({ name: 'perPage' })
  @IsNumber()
  limit: number;

  @IsOptional()
  @IsString()
  sortColumn?: string;

  @IsOptional()
  @Transform(({ value }) => {
    return value === 'ascend' ? 'ASC' : 'DESC';
  })
  @IsString()
  sortDirection?: 'ASC' | 'DESC';

  @IsOptional()
  textSearch?: string;

  constructor(page = 1, perPage = configService.get<number>('PER_PAGE')) {
    this.page = page;
    this.limit = +perPage;
  }
}
