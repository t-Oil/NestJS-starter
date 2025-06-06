import { ApiProperty } from '@nestjs/swagger';
import {
  ArrayMinSize,
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsUUID,
  MaxLength,
} from 'class-validator';
import { ActiveStatusEnum } from '@commons/enums/active-status.enum';
import { isDuplicateField } from '@commons/validators/is-duplicate-field.validator';
import { RoleRepository } from '@repositories/role.repository';

export class UpdateRoleRequest {
  @IsNotEmpty()
  @IsUUID()
  id: string;

  @IsNotEmpty()
  @IsNumber()
  updatedBy: number;

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
