import { Module } from '@nestjs/common';
import { UserService } from '@modules/user/services/user.service';
import { UserRepository } from '@repositories/user.repository';
import { UserController } from '@modules/user/controllers/user.controller';
import { IsDuplicateFieldConstraint } from '@commons/validators/is-duplicate-field.validator';

@Module({
  controllers: [UserController],
  providers: [
    UserService,
    UserRepository,
    IsDuplicateFieldConstraint,
  ],
})
export class UserModule {}
