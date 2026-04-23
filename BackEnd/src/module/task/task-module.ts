import { Module } from '@nestjs/common';
import { TaskService } from './service/task.service';
import { TaskController } from './controller/task.controller';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { UtilService } from 'src/common/services/util.service';
import { AuditLogModule } from '../auditLog/auditLog-module';

@Module({
  imports: [
    AuditLogModule
  ],
  controllers: [TaskController],
  providers: [
    TaskService,
    AuthGuard,
    UtilService
  ],
})
export class TaskModule {}