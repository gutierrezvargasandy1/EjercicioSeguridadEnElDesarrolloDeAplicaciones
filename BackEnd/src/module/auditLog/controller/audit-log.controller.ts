import { Controller, Get, Req, UseGuards, Logger } from '@nestjs/common';
import { AuditLogService } from '../service/audit-log.service';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { Roles } from 'src/common/decorators/role.decorator';

@Controller('api/audit-log')
export class AuditLogController {

  private readonly logger = new Logger(AuditLogController.name);

  constructor(private readonly auditService: AuditLogService) {

  }

  @Get('all')
  @UseGuards(AuthGuard)
  @Roles('ADMIN')
  public async getAll() {
    try {
      const result = await this.auditService.findAll();
      return result;
    } catch (error) {
      throw error;
    }
  }

  @Get('me')
  @UseGuards(AuthGuard)
  @Roles('ADMIN', 'CLIENT')
  public async getMyLogs(@Req() req: any) {

    if (!req.user || !req.user.id) {
    }

    try {
      const userId = req.user?.id;
      const result = await this.auditService.findByUser(userId);
      return result;
    } catch (error) {
      throw error;
    }
  }
}