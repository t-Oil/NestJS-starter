import { DataSource } from 'typeorm';

export interface Seeder {
  run(dataSource: DataSource, ...args: any[]): Promise<any>;
}
