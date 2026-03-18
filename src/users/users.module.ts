import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { PrismaService } from 'src/common/prisma/prisma.service';
import {AuthGuard}from 'src/common/guards/auth.guard'
import { AuthModule } from 'src/auth/auth.module';
import { UtilService } from 'src/common/services/util.service';
@Module({
  imports: [AuthModule],
  controllers: [UsersController],
  providers: [UsersService, PrismaService, AuthGuard, UtilService],
})
export class UsersModule {}
