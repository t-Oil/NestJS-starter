import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { BaseRepository } from '@repositories/base.repository';
import { AuthException } from '@exceptions/app/auth.exception';
import { OauthEntity } from '@entities/oauth.entity';

@Injectable()
export class OauthRepository extends BaseRepository<OauthEntity> {
  constructor(private dataSource: DataSource) {
    super(OauthEntity, dataSource.createEntityManager());
  }

  async store(user: number): Promise<OauthEntity> {
    try {
      const oauthUser: OauthEntity = this.create({
        user,
      });

      return await this.save(oauthUser);
    } catch (err) {
      console.log(err);
      AuthException.Unauthorized();
    }
  }

  async verifyToken(token: string): Promise<OauthEntity> {
    try {
      return await this.findOneOrFail({
        where: {
          token,
        },
        order: {
          createdAt: 'DESC',
        },
      });
    } catch (error) {
      AuthException.TokenExpired();
    }
  }
}
