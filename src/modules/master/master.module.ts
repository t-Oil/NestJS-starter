import { Module } from '@nestjs/common';
import { RouterModule } from '@nestjs/core';
import { DepartmentModule } from './department/department.module';

@Module({
  imports: [
    DepartmentModule,
    RouterModule.register([
      {
        path: 'masters',
        module: MasterModule,
        children: [
          {
            path: 'departments',
            module: DepartmentModule,
          },
        ],
      },
    ]),
  ],
})
export class MasterModule {}
