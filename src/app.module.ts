import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TaskController } from './task/controller/task.controller';
import { TaskService } from './task/service/task.service';
import { PrismaModule } from './prisma/prisma.module'
import { UserController } from './user/controller/user.controller';
import { UserService } from './user/service/user.service';

@Module({
  imports: [PrismaModule],
  controllers: [AppController, TaskController,UserController,],
  providers: [AppService, TaskService,UserService],
})
export class AppModule {}
