import { Report } from '../entities/reports/Report.js';
import { ReportRepository } from '../repositories/ReportRepository.js';

export class ReportService {
  constructor(private repo: ReportRepository) {}

  async create(report: Report) {
    return this.repo.create(report);
  }

  async getById(id: string) {
    return this.repo.findById(id);
  }

  async getAll() {
    return this.repo.findAll();
  }
}
