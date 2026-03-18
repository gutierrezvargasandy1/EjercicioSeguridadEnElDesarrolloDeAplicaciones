import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { UtilService } from 'src/common/services/util.service';

@Module({
  controllers: [UsersController],
  providers: [UsersService, PrismaService, UtilService],
})
export class UsersModule {}
