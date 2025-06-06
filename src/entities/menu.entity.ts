import {
  Column,
  Entity,
  JoinColumn,
  ManyToMany,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { BaseEntity } from './base-entity';
import { ActiveStatusEnum } from '@commons/enums/active-status.enum';
import { PermissionEntity } from './permission.entity';

@Entity('menus')
export class MenuEntity extends BaseEntity {
  @Column({ length: 250, nullable: true })
  name: string;

  @Column({ name: 'route_url', length: 100, nullable: true })
  routeUrl: string;

  @Column({ type: 'text', nullable: true })
  icon: string;

  @Column({ name: 'parent_id', nullable: true })
  parentId: number | null;

  @ManyToOne(() => MenuEntity, (menu) => menu.childrens, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'parent_id' })
  parent: MenuEntity;

  @OneToMany(() => MenuEntity, (menu) => menu.parent)
  childrens: MenuEntity[];

  @Column({ name: 'ordinal_no', type: 'int', default: 0 })
  ordinalNo: number;

  @Column({
    name: 'is_show',
    type: 'bool',
    default: true,
  })
  isShow: ActiveStatusEnum;

  @Column({
    name: 'is_public',
    type: 'bool',
    default: ActiveStatusEnum.IN_ACTIVE,
  })
  isPublic: ActiveStatusEnum;

  @ManyToMany(() => PermissionEntity, (permission) => permission.menus)
  permissions: PermissionEntity[];
}
