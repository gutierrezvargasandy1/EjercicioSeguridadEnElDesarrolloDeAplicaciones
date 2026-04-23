import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { CreateAuditLogDto } from '../dto/create-audit-log.dto';
import { AuditLog } from '../entities/auditLog-entity';

@Injectable()
export class AuditLogService {

  constructor(private readonly prisma: PrismaService) {}

  // ================= CREATE LOG =================
  async createLog(data: CreateAuditLogDto): Promise<AuditLog> {

    const log = await this.prisma.auditLog.create({
      data
    });

    return log; // ahora sí coincide
  }

  // ================= ADMIN: TODOS =================
  async findAll(): Promise<AuditLog[]> {

    const logs = await this.prisma.auditLog.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            role: true
          }
        }
      }
    });

    return logs;
  }

  // ================= USER: SUS LOGS =================
  async findByUser(userId: number): Promise<AuditLog[]> {

    const logs = await this.prisma.auditLog.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });

    return logs;
  }
}