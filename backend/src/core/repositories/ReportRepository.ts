import { Report } from '../entities/reports/Report.js';

export interface ReportRepository {
  create(report: Report): Promise<Report>;
  findById(id: string): Promise<Report | null>;
  findAll(): Promise<Report[]>;
}
