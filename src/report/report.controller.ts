import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ReportService } from './report.service';

@Controller('')
@ApiTags('user')
export class ReportController {
  constructor(private readonly reportService: ReportService) {}
}
