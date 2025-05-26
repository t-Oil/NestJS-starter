import { IsString, IsEmail, IsNotEmpty, IsNumber } from 'class-validator';
import { isDuplicateField } from '@commons/validators/is-duplicate-field.validator';
import { UserRepository } from '@repositories/user.repository';
import { ActiveStatusEnum } from '@commons/enums/active-status.enum';

export class CreateUserRequestDto {
  @IsNotEmpty()
  @IsString()
  firstName: string;

  @IsNotEmpty()
  @IsString()
  lastName: string;

  @IsNotEmpty()
  @isDuplicateField(UserRepository, 'email', {
    isActive: ActiveStatusEnum.ACTIVE,
  })
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsNumber()
  department: number;
}
