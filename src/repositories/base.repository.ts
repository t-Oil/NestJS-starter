import { Injectable } from '@nestjs/common';
import {
  EntityManager,
  EntityTarget,
  FindOneOptions,
  FindOptionsWhere,
  Repository,
  SelectQueryBuilder,
  Brackets,
} from 'typeorm';
import { IPaginationOptions, Pagination } from 'nestjs-typeorm-paginate';
import { ActiveStatusEnum } from '@commons/enums/active-status.enum';

export interface SearchFilter {
  field: string;
  operator: SearchOperator;
  value: any;
  logic?: 'AND' | 'OR';
}

export type SearchOperator =
  | 'eq'
  | 'ne'
  | 'gt'
  | 'gte'
  | 'lt'
  | 'lte'
  | 'like'
  | 'ilike'
  | 'in'
  | 'notin'
  | 'between'
  | 'isNull'
  | 'isNotNull'
  | 'startsWith'
  | 'endsWith';

export interface AdvancedSearchOptions {
  filters?: SearchFilter[];
  globalSearch?: {
    term: string;
    fields: string[];
  };
  groupLogic?: 'AND' | 'OR';
}

@Injectable()
export class BaseRepository<Entity> extends Repository<Entity> {
  private paramCounter = 0;

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
    sortColumn: string = 'updated_at',
    sortDirection: 'ASC' | 'DESC' = 'DESC',
    textSearch: string = '',
    searchFields?: string[],
    includes?: string[],
    whereConditions?: { [key: string]: any } | Array<{ [key: string]: any }>,
    advancedSearch?: AdvancedSearchOptions,
  ): Promise<Pagination<Entity>> {
    this.paramCounter = 0;
    const queryBuilder = this.manager.createQueryBuilder(this.entity, 'entity');
    const joinedRelations = new Set<string>();

    this.applyIncludes(queryBuilder, includes || [], joinedRelations);

    if (textSearch && searchFields?.length) {
      this.applyLegacyTextSearch(
        queryBuilder,
        searchFields,
        textSearch,
        joinedRelations,
      );
    }

    if (whereConditions) {
      this.applyLegacyWhereConditions(
        queryBuilder,
        whereConditions,
        joinedRelations,
      );
    }

    if (advancedSearch) {
      this.applyAdvancedSearch(queryBuilder, advancedSearch, joinedRelations);
    }

    const sortPath = this.resolveSortPath(sortColumn, joinedRelations);
    queryBuilder.orderBy(sortPath, sortDirection);

    queryBuilder
      .take(+options.limit)
      .skip((+options.page - 1) * +options.limit);

    const [data, total] = await queryBuilder.getManyAndCount();

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

  private applyIncludes(
    queryBuilder: SelectQueryBuilder<Entity>,
    includes: string[],
    joinedRelations: Set<string>,
  ): void {
    includes.forEach((relation) => {
      if (this.isValidRelation(relation)) {
        this.ensureRelationJoined(queryBuilder, relation, joinedRelations);
      } else {
        console.warn(`Invalid relation: ${relation}`);
      }
    });
  }

  private applyAdvancedSearch(
    queryBuilder: SelectQueryBuilder<Entity>,
    options: AdvancedSearchOptions,
    joinedRelations: Set<string>,
  ): void {
    const { filters, globalSearch, groupLogic = 'AND' } = options;

    this.preJoinRelationsForSearch(queryBuilder, options, joinedRelations);

    if (globalSearch?.term && globalSearch.fields?.length) {
      queryBuilder.andWhere(
        new Brackets((qb) => {
          globalSearch.fields.forEach((field, index) => {
            const columnPath = this.resolveFieldPath(field);
            const paramName = this.getUniqueParamName('global');

            const searchClause = `${columnPath} ILIKE :${paramName}`;
            const searchParam = { [paramName]: `%${globalSearch.term}%` };

            if (index === 0) {
              qb.where(searchClause, searchParam);
            } else {
              qb.orWhere(searchClause, searchParam);
            }
          });
        }),
      );
    }

    if (filters?.length) {
      queryBuilder.andWhere(
        new Brackets((qb) => {
          filters.forEach((filter, index) => {
            const filterResult = this.buildFilterClause(filter);
            const logic = filter.logic || groupLogic;

            if (index === 0) {
              qb.where(filterResult.clause, filterResult.params);
            } else if (logic === 'OR') {
              qb.orWhere(filterResult.clause, filterResult.params);
            } else {
              qb.andWhere(filterResult.clause, filterResult.params);
            }
          });
        }),
      );
    }
  }

  private preJoinRelationsForSearch(
    queryBuilder: SelectQueryBuilder<Entity>,
    options: AdvancedSearchOptions,
    joinedRelations: Set<string>,
  ): void {
    const fieldsToCheck: string[] = [];

    if (options.globalSearch?.fields) {
      fieldsToCheck.push(...options.globalSearch.fields);
    }

    if (options.filters) {
      fieldsToCheck.push(...options.filters.map((f) => f.field));
    }

    fieldsToCheck.forEach((field) => {
      if (field.includes('.')) {
        const relationPath = this.extractRelationPath(field);
        this.ensureNestedRelationJoined(
          queryBuilder,
          relationPath,
          joinedRelations,
        );
      }
    });
  }

  private applyGlobalSearch(
    queryBuilder: SelectQueryBuilder<Entity>,
    globalSearch: { term: string; fields: string[] },
    joinedRelations: Set<string>,
  ): void {
    globalSearch.fields.forEach((field, index) => {
      // Ensure relations are joined in the main query builder
      if (field.includes('.')) {
        const relationPath = this.extractRelationPath(field);
        this.ensureNestedRelationJoined(
          queryBuilder.subQuery(),
          relationPath,
          joinedRelations,
        );
      }

      const columnPath = this.resolveFieldPath(field);
      const paramName = this.getUniqueParamName('global');

      const searchClause = `${columnPath} ILIKE :${paramName}`;
      const searchParam = { [paramName]: `%${globalSearch.term}%` };

      if (index === 0) {
        queryBuilder.where(searchClause, searchParam);
      } else {
        queryBuilder.orWhere(searchClause, searchParam);
      }
    });
  }

  private buildFilterClause(filter: SearchFilter): {
    clause: string;
    params: Record<string, any>;
  } {
    const { field, operator, value } = filter;
    const columnPath = this.resolveFieldPath(field);
    const paramName = this.getUniqueParamName('filter');

    switch (operator) {
      case 'eq':
        return {
          clause: `${columnPath} = :${paramName}`,
          params: { [paramName]: value },
        };

      case 'ne':
        return {
          clause: `${columnPath} != :${paramName}`,
          params: { [paramName]: value },
        };

      case 'gt':
        return {
          clause: `${columnPath} > :${paramName}`,
          params: { [paramName]: value },
        };

      case 'gte':
        return {
          clause: `${columnPath} >= :${paramName}`,
          params: { [paramName]: value },
        };

      case 'lt':
        return {
          clause: `${columnPath} < :${paramName}`,
          params: { [paramName]: value },
        };

      case 'lte':
        return {
          clause: `${columnPath} <= :${paramName}`,
          params: { [paramName]: value },
        };

      case 'like':
        return {
          clause: `${columnPath} LIKE :${paramName}`,
          params: { [paramName]: `%${value}%` },
        };

      case 'ilike':
        return {
          clause: `${columnPath} ILIKE :${paramName}`,
          params: { [paramName]: `%${value}%` },
        };

      case 'startsWith':
        return {
          clause: `${columnPath} ILIKE :${paramName}`,
          params: { [paramName]: `${value}%` },
        };

      case 'endsWith':
        return {
          clause: `${columnPath} ILIKE :${paramName}`,
          params: { [paramName]: `%${value}` },
        };

      case 'in':
        const inValues = Array.isArray(value) ? value : [value];
        return {
          clause: `${columnPath} IN (:...${paramName})`,
          params: { [paramName]: inValues },
        };

      case 'notin':
        const notInValues = Array.isArray(value) ? value : [value];
        return {
          clause: `${columnPath} NOT IN (:...${paramName})`,
          params: { [paramName]: notInValues },
        };

      case 'between':
        if (!Array.isArray(value) || value.length !== 2) {
          throw new Error(
            'Between operator requires array with exactly 2 values',
          );
        }
        return {
          clause: `${columnPath} BETWEEN :${paramName}Start AND :${paramName}End`,
          params: {
            [`${paramName}Start`]: value[0],
            [`${paramName}End`]: value[1],
          },
        };

      case 'isNull':
        return {
          clause: `${columnPath} IS NULL`,
          params: {},
        };

      case 'isNotNull':
        return {
          clause: `${columnPath} IS NOT NULL`,
          params: {},
        };

      default:
        throw new Error(`Unsupported operator: ${operator}`);
    }
  }

  private ensureNestedRelationJoined(
    queryBuilder: SelectQueryBuilder<Entity>,
    relationPath: string,
    joinedRelations: Set<string>,
  ): void {
    const parts = relationPath.split('.');
    let currentPath = '';
    let currentAlias = 'entity';

    parts.forEach((part, index) => {
      currentPath = currentPath ? `${currentPath}.${part}` : part;

      if (
        !joinedRelations.has(currentPath) &&
        this.isValidRelation(currentPath)
      ) {
        const relationAlias = this.getRelationAlias(currentPath);
        queryBuilder.leftJoinAndSelect(
          `${currentAlias}.${part}`,
          relationAlias,
        );
        joinedRelations.add(currentPath);
        currentAlias = relationAlias;
      } else if (joinedRelations.has(currentPath)) {
        currentAlias = this.getRelationAlias(currentPath);
      }
    });
  }

  private ensureRelationJoined(
    queryBuilder: SelectQueryBuilder<Entity>,
    relation: string,
    joinedRelations: Set<string>,
  ): void {
    if (!joinedRelations.has(relation) && this.isValidRelation(relation)) {
      const relationAlias = this.getRelationAlias(relation);
      queryBuilder.leftJoinAndSelect(`entity.${relation}`, relationAlias);
      joinedRelations.add(relation);
    }
  }

  private resolveFieldPath(field: string): string {
    if (field.includes('.')) {
      const parts = field.split('.');
      const column = parts.pop();
      const relationPath = parts.join('.');
      const relationAlias = this.getRelationAlias(relationPath);
      return `${relationAlias}.${column}`;
    }
    return `entity.${field}`;
  }

  private extractRelationPath(field: string): string {
    const parts = field.split('.');
    parts.pop();
    return parts.join('.');
  }

  private resolveSortPath(
    sortColumn: string,
    joinedRelations: Set<string>,
  ): string {
    if (sortColumn.includes('.')) {
      const relationPath = this.extractRelationPath(sortColumn);
      if (joinedRelations.has(relationPath)) {
        return this.resolveFieldPath(sortColumn);
      }
    }
    return `entity.${sortColumn}`;
  }

  private getRelationAlias(relation: string): string {
    return relation.replace(/\./g, '_');
  }

  private getUniqueParamName(prefix: string): string {
    return `${prefix}_${++this.paramCounter}`;
  }

  private isValidRelation(relation: string): boolean {
    try {
      const entityMetadata = this.manager.connection.getMetadata(this.entity);
      const [rootRelation] = relation.split('.');
      return entityMetadata.relations.some(
        (r) => r.propertyName === rootRelation,
      );
    } catch {
      return false;
    }
  }

  private applyLegacyTextSearch(
    queryBuilder: SelectQueryBuilder<Entity>,
    searchFields: string[],
    textSearch: string,
    joinedRelations: Set<string>,
  ): void {
    searchFields.forEach((field) => {
      if (field.includes('.')) {
        const relationPath = this.extractRelationPath(field);
        this.ensureNestedRelationJoined(
          queryBuilder,
          relationPath,
          joinedRelations,
        );
      }
    });

    const concatFields = searchFields
      .map((field) => `COALESCE(${this.resolveFieldPath(field)}, '')`)
      .join(" || ' ' || ");

    if (concatFields) {
      const paramName = this.getUniqueParamName('textSearch');
      queryBuilder.andWhere(`(${concatFields}) ILIKE :${paramName}`, {
        [paramName]: `%${textSearch}%`,
      });
    }
  }

  private applyLegacyWhereConditions(
    queryBuilder: SelectQueryBuilder<Entity>,
    whereConditions: { [key: string]: any } | Array<{ [key: string]: any }>,
    joinedRelations: Set<string>,
  ): void {
    const allConditions = Array.isArray(whereConditions)
      ? whereConditions
      : [whereConditions];
    allConditions.forEach((condition) => {
      Object.keys(condition).forEach((key) => {
        if (key.includes('.')) {
          const relationPath = this.extractRelationPath(key);
          this.ensureNestedRelationJoined(
            queryBuilder,
            relationPath,
            joinedRelations,
          );
        }
      });
    });

    if (Array.isArray(whereConditions)) {
      queryBuilder.andWhere(
        new Brackets((qb) => {
          whereConditions.forEach((condition, index) => {
            const { clause, params } = this.buildLegacyWhereClause(condition);
            if (clause) {
              if (index === 0) {
                qb.where(clause, params);
              } else {
                qb.orWhere(clause, params);
              }
            }
          });
        }),
      );
    } else {
      const { clause, params } = this.buildLegacyWhereClause(whereConditions);
      if (clause) {
        queryBuilder.andWhere(clause, params);
      }
    }
  }

  private buildLegacyWhereClause(condition: { [key: string]: any }): {
    clause: string;
    params: Record<string, any>;
  } {
    const clauses: string[] = [];
    const parameters: Record<string, any> = {};

    Object.entries(condition).forEach(([key, value]) => {
      const columnPath = this.resolveFieldPath(key);
      const paramName = this.getUniqueParamName('legacy');

      clauses.push(`${columnPath} = :${paramName}`);
      parameters[paramName] = value;
    });

    return {
      clause: clauses.join(' AND '),
      params: parameters,
    };
  }
}
