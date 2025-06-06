import { Column, Entity, JoinTable, ManyToMany } from "typeorm";
import { BaseEntity } from "./base-entity";
import { PermissionEntity } from "./permission.entity";

@Entity('roles')
export class RoleEntity extends BaseEntity {
  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ name: 'is_default', type: 'bool', default: false })
  isDefault: boolean;

  @Column({ name: 'is_can_delete', type: 'bool', default: true })
  isCanDelete: boolean;

  @ManyToMany(() => PermissionEntity, { cascade: true })
  @JoinTable({
    name: 'role_permissions',
    joinColumn: { name: 'role_id' },
    inverseJoinColumn: { name: 'permission_id' },
  })
  permissions: PermissionEntity[];
}