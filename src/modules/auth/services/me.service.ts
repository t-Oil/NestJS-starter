import { Inject, Injectable } from '@nestjs/common';
import { Logger } from '@modules/logger/services/logger.service';
import { InjectRepository } from '@nestjs/typeorm';
import { AuthException } from '@exceptions/app/auth.exception';
import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager';
import { ActiveStatusEnum } from '@commons/enums/active-status.enum';
import { UserRepository } from '@repositories/user.repository';
import { UserEntity } from '@entities/user.entity';

@Injectable()
export class MeService {
  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private readonly logger: Logger,
    @InjectRepository(UserRepository)
    private readonly adminUserRepository: UserRepository,
  ) {}

  async getMe(userId: number): Promise<UserEntity> {
    const cachedData = await this.cacheManager.get(`auth-${userId}`);

    if (cachedData) {
      return cachedData as UserEntity;
    }

    try {
      const user: UserEntity =
        await this.adminUserRepository.findOneOrFail({
          where: {
            id: userId,
            isActive: ActiveStatusEnum.ACTIVE,
          },
        });

      await this.cacheManager.set(`auth-${userId}`, user);

      return user;
    } catch (error) {
      this.logger.error(`${MeService.name}[GET_ME]`, {
        error: {
          userId,
          message: error.message,
        },
      });
      throw AuthException.Unauthorized();
    }
  }
}
