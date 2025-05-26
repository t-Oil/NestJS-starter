import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
  let app: TestingModule;
  let appController: AppController;

  beforeAll(async () => {
    app = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('GET Health Check', () => {
    it('should return an object with a status property', () => {
      const result = appController.healthCheck();

      expect(result).toHaveProperty('data.status');
      expect(result.data.status).toBe(true);
    });
  });
});
