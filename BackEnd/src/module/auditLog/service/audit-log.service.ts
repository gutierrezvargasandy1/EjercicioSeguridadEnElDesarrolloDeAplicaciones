import { Injectable, HttpStatus, Logger } from '@nestjs/common';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { CreateAuditLogDto } from '../dto/create-audit-log.dto';
import { AppException } from 'src/common/exceptions/AppException';
import { ErrorCodes } from 'src/common/exceptions/errorCodes';

const toErr = (e: unknown): any => e as any;

@Injectable()
export class AuditLogService {

  private readonly logger = new Logger(AuditLogService.name);

  constructor(private readonly prisma: PrismaService) {

  }

  // ================= CREATE LOG =================
  async createLog(dto: CreateAuditLogDto) {

    try {
      const data = {
        userId: dto.userId,
        action: dto.action,
        entity: dto.entity,
        entityId: dto.entityId ?? null,
        oldValue: dto.oldValue ?? null,
        newValue: dto.newValue ?? null,
      };
      const result = await this.prisma.auditLog.create({ data });
      return result;

    } catch (error) {
      const err = toErr(error);
      throw new AppException(
        'Error al crear log de auditoría',
        HttpStatus.INTERNAL_SERVER_ERROR,
        ErrorCodes.AUDITLOG_CREATE_FAILED,
      );
    }
  }

  // ================= ADMIN =================
  async findAll() {
    try {
      console.log('[AuditLogService][findAll] Ejecutando prisma.auditLog.findMany()...');
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

      return logs || [];

    } catch (error) {
      const err = toErr(error);
      return [];
    }
  }

  // ================= USER =================
  async findByUser(userId: number) {


    if (userId === undefined || userId === null) {
    }

    try {
      console.log('[AuditLogService][findByUser] Ejecutando findMany con userId:', userId);
      const logs = await this.prisma.auditLog.findMany({
        where: { userId },
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

      return logs || [];

    } catch (error) {
      const err = toErr(error);

      return [];
    }
  }
}