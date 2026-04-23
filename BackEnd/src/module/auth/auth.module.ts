import { Module } from '@nestjs/common';
import { AuthController } from './controller/auth.controller';
import { AuthService } from './service/auth.service';
import { JwtModule } from '@nestjs/jwt';
import { UtilService } from 'src/common/services/util.service';
import { AuthGuard } from 'src/common/guards/auth.guard';

import { AuditLogModule } from '../auditLog/auditLog-module';

@Module({
  imports: [
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '60s' },
    }),

    AuditLogModule,
  ],

  controllers: [AuthController],

  providers: [
    AuthService,
    UtilService,
    AuthGuard,
  ],

  exports: [
    UtilService,
    JwtModule,
    AuthService,
  ],
})
export class AuthModule {}