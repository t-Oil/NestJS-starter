import { HttpStatus } from '@nestjs/common';
import { IPaginationLinks, IPaginationMeta } from 'nestjs-typeorm-paginate';

export class ApiResource {
  [x: string]: any;
  /**
   * Success response
   * @param [data]
   * @returns SuccessResponseInterface
   */
  static successResponse(data?: any): SuccessResponseInterface {
    if (!data) {
      return { status: { code: HttpStatus.OK, message: 'OK' } };
    }

    if (data?.items) {
      const { items, links, meta } = data;

      return {
        data: items,
        links,
        meta,
        status: { code: HttpStatus.OK, message: 'OK' },
      };
    }

    return { data, status: { code: HttpStatus.OK, message: 'OK' } };
  }

  /**
   * Errors response
   * @param error
   */
  static errorResponse(error: Error): ErrorResponseInterface {
    // All exception will be handle by exception filters
    throw error;
  }
}

export interface SuccessResponseInterface {
  status: { code: number; message: string };
  data?: Record<string, unknown>;
  links?: IPaginationLinks;
  meta?: IPaginationMeta;
}

export interface ErrorResponseInterface {
  status: { code: number; message: string };
  error: { code: number; message: string; errors: string[] };
}
