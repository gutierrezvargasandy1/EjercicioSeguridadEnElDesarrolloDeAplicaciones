import { Injectable, HttpStatus } from '@nestjs/common';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { CreateAuditLogDto } from '../dto/create-audit-log.dto';
import { AuditLog } from '../entities/auditLog-entity';
import { AppException } from 'src/common/exceptions/AppException';
import { ErrorCodes } from 'src/common/exceptions/errorCodes';

@Injectable()
export class AuditLogService {

  constructor(private readonly prisma: PrismaService) {}

  // ================= CREATE LOG =================
  async createLog(data: CreateAuditLogDto): Promise<AuditLog> {

    try {
      return await this.prisma.auditLog.create({
        data
      });

    } catch (error) {
      throw new AppException(
        'Error al crear log de auditoría',
        HttpStatus.INTERNAL_SERVER_ERROR,
        ErrorCodes.AUDITLOG_CREATE_FAILED,
      );
    }
  }

  // ================= ADMIN: TODOS LOS LOGS =================
  async findAll(): Promise<AuditLog[]> {

    try {
      return await this.prisma.auditLog.findMany({
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

    } catch (error) {
      throw new AppException(
        'Error al obtener logs de auditoría',
        HttpStatus.INTERNAL_SERVER_ERROR,
        ErrorCodes.DATABASE_ERROR,
      );
    }
  }

  // ================= USER: SUS LOGS =================
  async findByUser(userId: number): Promise<AuditLog[]> {

    try {
      const logs = await this.prisma.auditLog.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' }
      });

      if (!logs || logs.length === 0) {
        throw new AppException(
          'No se encontraron logs para este usuario',
          HttpStatus.NOT_FOUND,
          ErrorCodes.AUDITLOG_NOT_FOUND,
        );
      }

      return logs;

    } catch (error) {

      // si ya es AppException lo dejamos pasar
      if (error instanceof AppException) {
        throw error;
      }

      throw new AppException(
        'Error al obtener logs del usuario',
        HttpStatus.INTERNAL_SERVER_ERROR,
        ErrorCodes.DATABASE_ERROR,
      );
    }
  }
}