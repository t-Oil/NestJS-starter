import { Injectable } from '@nestjs/common';
import {
  EntityManager,
  EntityTarget,
  FindOneOptions,
  FindOptionsWhere,
  Repository,
  SelectQueryBuilder,
} from 'typeorm';
import { IPaginationOptions, Pagination } from 'nestjs-typeorm-paginate';
import { ActiveStatusEnum } from '@commons/enums/active-status.enum';

@Injectable()
export class BaseRepository<Entity> extends Repository<Entity> {
  constructor(
    private entity: EntityTarget<Entity>,
    manager: EntityManager,
  ) {
    super(entity, manager);
  }

  async findOneWithActive(
    options?: FindOneOptions<Entity>,
  ): Promise<Entity | null> {
    const mergedWhere: FindOptionsWhere<Entity> = {
      ...(options?.where as FindOptionsWhere<Entity>),
      isActive: ActiveStatusEnum.ACTIVE,
    };

    return await this.manager.findOne<Entity>(this.entity, {
      ...options,
      where: mergedWhere,
    });
  }

  async paginate(
    options: IPaginationOptions,
    sortColumn: string = 'updatedAt',
    sortDirection: 'ASC' | 'DESC' = 'DESC',
    textSearch: string = '',
    searchFields?: string[],
    includes?: string[],
    whereConditions?: { [key: string]: any } | Array<{ [key: string]: any }>,
  ): Promise<Pagination<Entity>> {
    const queryBuilder: SelectQueryBuilder<Entity> =
      this.manager.createQueryBuilder(this.entity, 'entity');

    const joinedRelations = new Set<string>();

    if (includes?.length) {
      includes.forEach((relation) => {
        if (this.isValidRelation(relation)) {
          const relationAlias = `${relation.replace(/\./g, '_')}`;
          queryBuilder.leftJoinAndSelect(`entity.${relation}`, relationAlias);
          joinedRelations.add(relation);
        } else {
          console.error(`${BaseRepository.name}[INCLUDES]`, {
            errors: `Invalid relation: ${relation} not found in entity.`,
          });
        }
      });
    }

    if (textSearch && searchFields?.length > 0) {
      this.applyTextSearch(
        queryBuilder,
        searchFields,
        textSearch,
        joinedRelations,
      );
    }

    if (whereConditions) {
      this.applyWhereConditions(queryBuilder, whereConditions, joinedRelations);
    }

    const [data, total] = await queryBuilder
      .take(+options.limit)
      .skip((+options.page - 1) * +options.limit)
      .orderBy(`entity.${sortColumn}`, sortDirection)
      .getManyAndCount();

    return {
      items: data,
      meta: {
        totalItems: total,
        itemCount: data.length,
        itemsPerPage: +options.limit,
        totalPages: Math.ceil(total / +options.limit),
        currentPage: +options.page,
      },
    };
  }

  private isValidRelation(relation: string): boolean {
    const entityMetadata = this.manager.connection.getMetadata(this.entity);
    const [rootRelation] = relation.split('.');
    return entityMetadata.relations.some(
      (r) => r.propertyName === rootRelation,
    );
  }

  private applyTextSearch(
    queryBuilder: SelectQueryBuilder<Entity>,
    searchFields: string[],
    textSearch: string,
    joinedRelations: Set<string>,
  ): void {
    searchFields.forEach((field) => {
      if (field.includes('.')) {
        const [relation] = field.split('.');
        this.ensureRelationJoined(queryBuilder, relation, joinedRelations);
      }
    });

    const concatFields = searchFields
      .map((field) => {
        if (field.includes('.')) {
          const [relation, column] = field.split('.');
          const relationAlias = `${relation.replace(/\./g, '_')}`;
          return `COALESCE(${relationAlias}.${column}, '')`;
        }
        return `COALESCE(entity.${field}, '')`;
      })
      .filter(Boolean)
      .join(" || ' ' || ");

    if (concatFields) {
      queryBuilder.andWhere(`(${concatFields}) LIKE :textSearch`, {
        textSearch: `%${textSearch}%`,
      });
    }
  }

  private ensureRelationJoined(
    queryBuilder: SelectQueryBuilder<Entity>,
    relation: string,
    joinedRelations: Set<string>,
  ): void {
    if (!joinedRelations.has(relation) && this.isValidRelation(relation)) {
      const relationAlias = `${relation.replace(/\./g, '_')}`;
      queryBuilder.leftJoinAndSelect(`entity.${relation}`, relationAlias);
      joinedRelations.add(relation);
    }
  }

  private applyWhereConditions(
    queryBuilder: SelectQueryBuilder<Entity>,
    whereConditions: { [key: string]: any } | Array<{ [key: string]: any }>,
    joinedRelations: Set<string>,
  ): void {
    if (Array.isArray(whereConditions)) {
      const whereClauses: string[] = [];
      const parameters: any = {};

      whereConditions.forEach((condition, index) => {
        const { clause, params } = this.buildWhereClause(
          condition,
          joinedRelations,
          `or${index}_`,
        );
        if (clause) {
          whereClauses.push(`(${clause})`);
          Object.assign(parameters, params);
        }
      });

      if (whereClauses.length > 0) {
        queryBuilder.andWhere(`(${whereClauses.join(' OR ')})`, parameters);
      }
    } else {
      const { clause, params } = this.buildWhereClause(
        whereConditions,
        joinedRelations,
      );
      if (clause) {
        queryBuilder.andWhere(clause, params);
      }
    }
  }

  private buildWhereClause(
    condition: { [key: string]: any },
    joinedRelations: Set<string>,
    paramPrefix: string = '',
  ): { clause: string; params: any } {
    const clauses: string[] = [];
    const parameters: any = {};

    Object.keys(condition).forEach((key) => {
      const value = condition[key];

      if (
        typeof value === 'object' &&
        value !== null &&
        !Array.isArray(value)
      ) {
        this.ensureRelationJoined(
          this.manager.createQueryBuilder(this.entity, 'entity'),
          key,
          joinedRelations,
        );
      } else if (key.includes('.')) {
        const [relation] = key.split('.');
        this.ensureRelationJoined(
          this.manager.createQueryBuilder(this.entity, 'entity'),
          relation,
          joinedRelations,
        );
      }
    });

    Object.keys(condition).forEach((key) => {
      const value = condition[key];

      if (
        typeof value === 'object' &&
        value !== null &&
        !Array.isArray(value)
      ) {
        const relationAlias = `${key.replace(/\./g, '_')}`;

        Object.keys(value).forEach((field) => {
          const paramName = `${paramPrefix}${relationAlias}_${field}`;
          clauses.push(`${relationAlias}.${field} = :${paramName}`);
          parameters[paramName] = value[field];
        });
      } else if (key.includes('.')) {
        const [relation, field] = key.split('.');
        const relationAlias = `${relation.replace(/\./g, '_')}`;
        const paramName = `${paramPrefix}${relationAlias}_${field}`;

        clauses.push(`${relationAlias}.${field} = :${paramName}`);
        parameters[paramName] = value;
      } else {
        const paramName = `${paramPrefix}${key}`;
        clauses.push(`entity.${key} = :${paramName}`);
        parameters[paramName] = value;
      }
    });

    return {
      clause: clauses.join(' AND '),
      params: parameters,
    };
  }
}
