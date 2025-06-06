import { Module } from '@nestjs/common';
import { RoleController } from './controllers/role.controller';
import { RoleService } from './services/role.service';
import { RoleRepository } from '@repositories/role.repository';
import { PermissionRepository } from '@repositories/permission.repository';
import { IsDuplicateFieldConstraint } from '@commons/validators/is-duplicate-field.validator';

@Module({
  controllers: [RoleController],
  providers: [
    RoleService,
    RoleRepository,
    PermissionRepository,
    IsDuplicateFieldConstraint,
  ],
})
export class RoleModule {}
