import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaService } from './common/prisma/prisma.service';
import { UsersModule } from './module/users/users.module';
import { AuthModule } from './auth/auth.module';
import { TaskController } from './module/task/controller/task.controller';
import { TaskService } from './module/task/service/task.service';

@Module({
  imports: [UsersModule, AuthModule], 
  controllers: [AppController, TaskController],
  providers: [AppService, TaskService, PrismaService],
})
export class AppModule {}