import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { AuditLogService } from '../service/audit-log.service';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { Roles } from 'src/common/decorators/role.decorator';

@Controller('audit-log')
export class AuditLogController {

  constructor(private readonly auditService: AuditLogService) {}

  // ================= ADMIN: TODOS LOS MOVIMIENTOS =================
  @Get('all')
  @Roles('ADMIN')
  @UseGuards(AuthGuard)
  public async getAll() {
    return this.auditService.findAll();
  }

  // ================= USER: SUS MOVIMIENTOS =================
  @Get('me')
  @Roles('ADMIN', 'CLIENT')
  @UseGuards(AuthGuard)
  public async getMyLogs(@Req() req: any) {
    return this.auditService.findByUser(req.user.id);
  }
}