import { ActiveStatusEnum } from '@commons/enums/active-status.enum';
import { isDuplicateField } from '@commons/validators/is-duplicate-field.validator';
import { ApiProperty } from '@nestjs/swagger';
import { RoleRepository } from '@repositories/role.repository';
import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  MaxLength,
} from 'class-validator';

export class CreateRoleRequest {
  @MaxLength(100)
  @isDuplicateField(RoleRepository, 'name', {
    isActive: ActiveStatusEnum.ACTIVE,
  })
  @IsNotEmpty()
  @ApiProperty()
  name: string;

  @IsOptional()
  @ApiProperty()
  description: string;

  @IsNotEmpty()
  @IsNumber()
  createdBy?: number;

  @IsNotEmpty()
  @IsArray()
  @ApiProperty()
  permissions: string[];

  @IsNotEmpty()
  @IsNumber()
  isActive: ActiveStatusEnum = ActiveStatusEnum.ACTIVE;
}
