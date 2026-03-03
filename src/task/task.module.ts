import { Module } from '@nestjs/common';
import { TaskController } from '../task/controller/task.controller';
import { TaskService } from '../task/service/task.service';

@Module({
  controllers: [TaskController],
  providers: [TaskService],
})
export class TaskModule {}