import { Column, Entity } from "typeorm";
import { BaseEntity } from "@entities/base-entity";

@Entity('ms_departments')
export class MsDepartmentEntity extends BaseEntity{
  @Column({ length: 50 })
  name: string;
}
