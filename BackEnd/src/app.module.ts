import { Module } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';

import { AppController } from './app.controller';
import { AppService } from './app.service';

import { UsersModule } from './module/users/users.module';
import { AuthModule } from './module/auth/auth.module';
import { TaskModule } from './module/task/task-module';
import { AuditLogModule } from './module/auditLog/auditLog-module';

import { AllExceptionFilter } from './common/filters/http-exception.filter';
import { PrismaModule } from './common/prisma/prisma-module';

@Module({
  imports: [
    PrismaModule,
    UsersModule,
    AuthModule,
    TaskModule,
    AuditLogModule,
  ],

  controllers: [AppController],

  providers: [
    AppService,
    {
      provide: APP_FILTER,
      useClass: AllExceptionFilter,
    },
  ],
})
export class AppModule {}