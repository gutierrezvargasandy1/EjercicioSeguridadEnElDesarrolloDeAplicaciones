import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TaskController } from './auth/controller/task.controller';
import { TaskService } from './auth/service/task.service';
import { databaseProvider } from './database/database.provide';
import { PrismaModule } from './prisma/prisma.module'

@Module({
  imports: [PrismaModule],
  controllers: [AppController, TaskController],
  providers: [AppService, TaskService, databaseProvider[0]],
})
export class AppModule {}
