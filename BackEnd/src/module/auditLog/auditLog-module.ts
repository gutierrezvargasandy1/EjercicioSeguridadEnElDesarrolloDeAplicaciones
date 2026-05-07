// auditLog-module.ts
import { Module, forwardRef } from '@nestjs/common';
import { AuditLogController } from './controller/audit-log.controller';
import { AuditLogService } from './service/audit-log.service';
import { PrismaModule } from 'src/common/prisma/prisma-module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [PrismaModule, forwardRef(() => AuthModule)],
  controllers: [AuditLogController],
  providers: [AuditLogService],
  exports: [AuditLogService],
})
export class AuditLogModule {}