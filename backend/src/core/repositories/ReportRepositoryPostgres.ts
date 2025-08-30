import { Report } from '../entities/reports/Report.js';
import { ReportRepository } from './ReportRepository.js';

export class ReportRepositoryPostgres implements ReportRepository {
  async create(report: Report): Promise<Report> {
    // TODO: Implement DB logic
    return report;
  }
  async findById(id: string): Promise<Report | null> {
    // TODO: Implement DB logic
    return null;
  }
  async findAll(): Promise<Report[]> {
    // TODO: Implement DB logic
    return [];
  }
}
