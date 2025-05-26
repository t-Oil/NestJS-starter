import { Controller, Get, Query } from '@nestjs/common';
import { UseResources } from '@interceptors/use-resources.interceptor';
import { ApiResource } from '@commons/responses/api-resource';
import { MsDepartmentEntity } from '@entities/ms-department.entity';
import { DepartmentService } from '../services/department.service';
import { DepartmentResource } from '../resources/department.resource';

@Controller()
export class DepartmentController {
  constructor(private readonly departmentService: DepartmentService) {}

  @Get()
  @UseResources(DepartmentResource)
  async findAll(
    @Query('textSearch') textSearch?: string,
  ): Promise<ApiResource> {
    const response: MsDepartmentEntity[] = await this.departmentService.findAll(textSearch);

    return ApiResource.successResponse(
      response
    )
  }
}
