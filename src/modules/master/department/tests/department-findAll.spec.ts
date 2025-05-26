import { Test, TestingModule } from '@nestjs/testing';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { MsDepartmentEntity } from '@entities/ms-department.entity';
import { DepartmentService } from '../services/department.service';
import { DepartmentRepository } from '@repositories/department.repository';

describe('DepartmentService - findAll', () => {
  let service: DepartmentService;
  let repository: Repository<MsDepartmentEntity>;

  const mockDepartments = [
    {
      id: 1,
      name: 'Marketing',
      uid: 'uuid1',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 2,
      name: 'Operations',
      uid: 'uuid2',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DepartmentService,
        {
          provide: getRepositoryToken(DepartmentRepository),
          useValue: {
            createQueryBuilder: jest.fn(() => ({
              where: jest.fn().mockReturnThis(),
              orderBy: jest.fn().mockReturnThis(),
              getMany: jest.fn().mockResolvedValue(mockDepartments),
            })),
          },
        },
      ],
    }).compile();

    service = module.get<DepartmentService>(DepartmentService);
    repository = module.get<Repository<MsDepartmentEntity>>(
      getRepositoryToken(DepartmentRepository),
    );
  });

  it('should return all departments ordered by name_th (happy path)', async () => {
    const result = await service.findAll('');
    expect(result).toEqual(mockDepartments);
    expect(repository.createQueryBuilder).toHaveBeenCalledWith('department');
  });

  it('should return departments matching the text search', async () => {
    const queryBuilder = repository.createQueryBuilder('department');

    jest.spyOn(queryBuilder, 'where').mockReturnThis();
    jest.spyOn(queryBuilder, 'orderBy').mockReturnThis();
    jest.spyOn(repository, 'createQueryBuilder').mockReturnValue(queryBuilder);

    const result = await service.findAll('Operat');
    expect(result).toEqual(mockDepartments);
  });

  it('should return empty array when no matches found', async () => {
    const queryBuilder = repository.createQueryBuilder('department');
    jest.spyOn(queryBuilder, 'where').mockReturnThis();
    jest.spyOn(queryBuilder, 'orderBy').mockReturnThis();
    jest.spyOn(queryBuilder, 'getMany').mockResolvedValue([]);
    jest.spyOn(repository, 'createQueryBuilder').mockReturnValue(queryBuilder);

    const result = await service.findAll('Unknown');
    expect(result).toEqual([]);
  });

  it('should throw an error if database operation fails', async () => {
    const queryBuilder = repository.createQueryBuilder('department');
    jest.spyOn(queryBuilder, 'where').mockReturnThis();
    jest.spyOn(queryBuilder, 'orderBy').mockReturnThis();
    jest
      .spyOn(queryBuilder, 'getMany')
      .mockRejectedValue(new Error('Database error'));
    jest.spyOn(repository, 'createQueryBuilder').mockReturnValue(queryBuilder);

    await expect(service.findAll('')).rejects.toThrow('Database error');
  });
});
