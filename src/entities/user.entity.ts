import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { MsDepartmentEntity } from './ms-department.entity';
import { ActiveStatusEnum } from '@commons/enums/active-status.enum';
import { generateRandomString } from '@commons/utils/index.util';

@Entity('users')
export class UserEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'uuid', unique: true })
  uid!: string;

  @Column({ name: 'email', type: 'varchar' })
  email: string;

  @Column({ type: 'varchar' })
  password: string;

  @Column({ name: 'first_name', length: 100 })
  firstName: string;

  @Column({ name: 'last_name', length: 100 })
  lastName: string;

  @Column({ name: 'department_id', type: 'int', nullable: true })
  departmentId?: number;

  @ManyToOne(() => MsDepartmentEntity)
  @JoinColumn({ name: 'department_id' })
  department: MsDepartmentEntity;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt!: Date;

  @Column({ name: 'updated_by', nullable: true })
  updatedById!: number;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
  updatedAt!: Date;

  @DeleteDateColumn({ name: 'deleted_at', type: 'timestamp', nullable: true })
  deletedAt!: Date;

  @Column({
    name: 'is_active',
    type: 'enum',
    enum: ActiveStatusEnum,
    default: ActiveStatusEnum.ACTIVE,
  })
  isActive!: ActiveStatusEnum;

  @BeforeInsert()
  insertCreated() {
    this.uid = generateRandomString(20);
    this.createdAt = new Date();
    this.updatedAt = new Date();
  }

  @BeforeUpdate()
  insertUpdated() {
    this.updatedAt = new Date();
  }
}
