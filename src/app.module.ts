import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TaskController } from './task/controller/task.controller';
import { TaskService } from './task/service/task.service';
import { PrismaModule } from './prisma/prisma.module'

@Module({
  imports: [PrismaModule],
  controllers: [AppController, TaskController],
  providers: [AppService, TaskService],
})
export class AppModule {}
