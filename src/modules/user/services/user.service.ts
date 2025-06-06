import { Injectable } from '@nestjs/common';
import { UserRepository } from '@repositories/user.repository';
import { InjectRepository } from '@nestjs/typeorm';
import { IPaginationOptions, Pagination } from 'nestjs-typeorm-paginate';
import { UserEntity } from '@entities/user.entity';
import { UserException } from '@exceptions/app/user.exception';
import { ActiveStatusEnum } from '@commons/enums/active-status.enum';
import { CreateUserRequestDto } from '../requests/create-user.request';
import { hashSync } from 'bcryptjs';
import { generateRandomString } from '@commons/utils/index.util';
import { UpdateResult } from 'typeorm';
import { UpdateUserRequestDto } from '../requests/update-user.request';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserRepository)
    private readonly userRepository: UserRepository,
  ) {}

  async paginate(
    textSearch = '',
    options: IPaginationOptions,
    sortColumn: string = 'updatedAt',
    sortDirection: 'ASC' | 'DESC' = 'DESC',
    includes?: string,
    conditions?: { [key: string]: any },
  ): Promise<Pagination<UserEntity>> {
    return await this.userRepository.paginate(
      options,
      sortColumn,
      sortDirection,
      textSearch,
      ['firstName', 'lastName', 'email'],
      includes?.split(','),
      {
        ...conditions,
      },
    );
  }

  async getById(uid: string, includes?: string): Promise<UserEntity> {
    try {
      return await this.userRepository.findOneOrFail({
        relations: includes?.split(','),
        where: {
          uid,
          isActive: ActiveStatusEnum.ACTIVE,
        },
      });
    } catch (error) {
      throw UserException.notFound();
    }
  }

  async create(payload: CreateUserRequestDto): Promise<UserEntity> {
    try {
      const generatePassword: string = generateRandomString(10);

      const created: UserEntity = this.userRepository.create({
        email: payload.email,
        firstName: payload.firstName,
        lastName: payload.lastName,
        password: hashSync(generatePassword, 10),
        departmentId: payload.department,
      });

      return await this.userRepository.save(created);
    } catch (error) {
      throw UserException.createError([
        'Something went wrong when creating user',
      ]);
    }
  }

  async delete(uid: string): Promise<UpdateResult> {
    try {
      const user = await this.getById(uid);
      user.isActive = ActiveStatusEnum.IN_ACTIVE;

      return await this.userRepository.update(user.id, {
        isActive: ActiveStatusEnum.IN_ACTIVE,
        deletedAt: new Date(),
      });
    } catch (error) {
      throw UserException.notFound();
    }
  }

  async update(
    uid: string,
    payload: UpdateUserRequestDto,
  ): Promise<UserEntity> {
    const user = await this.getById(uid);

    try {
      this.userRepository.merge(user, {
        firstName: payload.firstName,
        lastName: payload.lastName,
        departmentId: payload.department,
      });

      const updatedUser: UserEntity = await this.userRepository.save(user);

      return this.getById(updatedUser.uid, 'department');
    } catch (error) {
      throw UserException.updateError([
        'Something went wrong when updating user',
      ]);
    }
  }
}
