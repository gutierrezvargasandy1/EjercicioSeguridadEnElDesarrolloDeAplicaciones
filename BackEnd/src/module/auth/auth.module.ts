import { Module } from '@nestjs/common';
import { AuthController } from './controller/auth.controller';
import { AuthService } from './service/auth.service';
import { JwtModule } from '@nestjs/jwt';
import { UtilService } from 'src/common/services/util.service';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { AuthGuard } from 'src/common/guards/auth.guard';

@Module({
  imports:[
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '60s' },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, UtilService, PrismaService, AuthGuard],
  exports:[UtilService ,JwtModule , AuthService]
})
export class AuthModule {}