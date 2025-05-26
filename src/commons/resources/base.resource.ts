import { Expose } from 'class-transformer';
import { ActiveStatusEnum } from '@commons/enums/active-status.enum';

export class BaseResourceDto {
  @Expose({ name: 'uid' })
  id: number | string;

  @Expose()
  status: ActiveStatusEnum;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;
}
