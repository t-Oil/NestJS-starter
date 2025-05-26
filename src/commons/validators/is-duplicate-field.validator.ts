import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { Injectable } from '@nestjs/common';
import { get } from 'lodash';
import { Not, Repository } from 'typeorm';
import { ModuleRef } from '@nestjs/core';

@ValidatorConstraint({ async: true })
@Injectable()
export class IsDuplicateFieldConstraint
  implements ValidatorConstraintInterface
{
  constructor(private moduleRef: ModuleRef) {}

  async validate(value: any, args: ValidationArguments): Promise<boolean> {
    const [repositoryName, field, filterOptions = {}] = args.constraints;

    const repository = this.moduleRef.get(repositoryName, { strict: false });
    if (!repository) {
      throw new Error(`Repository ${repositoryName} not found`);
    }

    const where = { [field]: value, ...filterOptions };

    const uid = get(args.object, 'uid');
    if (uid) {
      where.uid = Not(uid);
    }

    const count = await repository.count({ where });
    return count === 0;
  }

  defaultMessage(args: ValidationArguments): string {
    const [_, field] = args.constraints;
    return `${field} already exists`;
  }
}

export function isDuplicateField(
  repositoryToken: Function | string,
  field: string,
  filterOptions?: Record<string, any>,
  validationOptions?: ValidationOptions,
) {
  return (object: Record<string, any>, propertyName: string) => {
    registerDecorator({
      name: 'isDuplicateField',
      target: object.constructor,
      propertyName,
      options: validationOptions,
      constraints: [repositoryToken, field, filterOptions],
      validator: IsDuplicateFieldConstraint,
      async: true,
    });
  };
}
