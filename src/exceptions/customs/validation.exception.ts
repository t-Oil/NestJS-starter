import { HttpException, ValidationError } from '@nestjs/common';
import { map } from 'lodash';

export class ValidationException extends HttpException {
  constructor(errors: ValidationError[], status: number) {
    super(errors, status);
  }
}

export class FlattenValidationErrors {
  constructor(private validationErrors: ValidationError[]) {}

  messages(): string[] {
    return map(this.validationErrors, (error: ValidationError) =>
      this.mapChildrenToValidationErrors(error),
    )
      .flat()
      .filter((item) => !!item.constraints)
      .map((item) => Object.values(item.constraints))
      .flat();
  }

  private mapChildrenToValidationErrors(
    error: ValidationError,
    parentPath?: string,
  ): ValidationError[] {
    if (!(error.children && error.children.length)) {
      return [error];
    }

    const validationErrors = [];

    parentPath = parentPath
      ? `${parentPath}.${error.property}`
      : error.property;

    for (const item of error.children) {
      if (item.children && item.children.length) {
        validationErrors.push(
          ...this.mapChildrenToValidationErrors(item, parentPath),
        );
      }

      validationErrors.push(
        this.prependConstraintsWithParentProp(parentPath, item),
      );
    }

    return validationErrors;
  }

  private prependConstraintsWithParentProp(
    parentPath: string,
    error: ValidationError,
  ): ValidationError {
    const constraints = Object();

    for (const key in error.constraints) {
      constraints[key] = `${parentPath}.${error.constraints[key]}`;
    }

    return Object.assign(Object.assign({}, error), { constraints });
  }
}
