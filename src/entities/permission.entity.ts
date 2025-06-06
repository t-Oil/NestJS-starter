import { Column, Entity, JoinColumn, ManyToMany, ManyToOne } from 'typeorm';
import { BaseEntity } from './base-entity';
import { RoleEntity } from './role.entity';
import { MenuEntity } from './menu.entity';

@Entity('permissions')
export class PermissionEntity extends BaseEntity {
  @Column({ type: 'varchar', length: 100 })
  value: string;

  @Column({ name: 'menu_id', type: 'int' })
  menuId: number;

  @ManyToOne(() => MenuEntity, (menu) => menu.permissions)
  @JoinColumn({ name: 'menu_id' })
  menus: MenuEntity[];

  @ManyToMany(() => RoleEntity, (role) => role.permissions)
  roles: RoleEntity[];
}
