import { Injectable, HttpStatus } from '@nestjs/common';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { User } from '../entities/user.entity';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { UtilService } from 'src/common/services/util.service';
import { AuditLogService } from 'src/module/auditLog/service/audit-log.service';
import { AppException } from 'src/common/exceptions/AppException';
import { ErrorCodes } from 'src/common/exceptions/errorCodes';

@Injectable()
export class UsersService {

  constructor(
    private prisma: PrismaService,
    private util: UtilService,
    private auditLogService: AuditLogService,
  ) {}

  // ================= CREATE USER =================
  public async insertUser(user: CreateUserDto): Promise<User> {

    try {
      const hashedPassword = await this.util.hash(user.password);

      const created = await this.prisma.user.create({
        data: {
          ...user,
          password: hashedPassword,
        },
        select: {
          id: true,
          name: true,
          lastname: true,
          username: true,
          created_at: true
        }
      });

      await this.auditLogService.createLog({
        userId: created.id,
        action: 'CREATE_USER',
        entity: 'USER',
        oldValue: null,
        entityId: created.id,
        newValue: created,
      });

      return created;

    } catch (error) {
      throw new AppException(
        'Error al crear el usuario',
        HttpStatus.INTERNAL_SERVER_ERROR,
        ErrorCodes.USER_CREATE_FAILED, 
      );
    }
  }

  // ================= UPDATE USER =================
  public async updateUser(
    id: number,
    userUpdated: UpdateUserDto
  ): Promise<User> {

    const oldUser = await this.prisma.user.findUnique({
      where: { id }
    });

    if (!oldUser) {
      throw new AppException(
        'Usuario no encontrado',
        HttpStatus.NOT_FOUND,
        ErrorCodes.USER_NOT_FOUND_DB,
      );
    }

    try {
      const data: any = { ...userUpdated };

      if (data.password) {
        data.password = await this.util.hash(data.password);
      }

      const updated = await this.prisma.user.update({
        where: { id },
        data,
        select: {
          id: true,
          name: true,
          lastname: true,
          username: true,
          created_at: true
        }
      });

      await this.auditLogService.createLog({
        userId: id,
        action: 'UPDATE_USER',
        entity: 'USER',
        entityId: id,
        oldValue: oldUser,
        newValue: updated,
      });

      return updated;

    } catch (error) {
      throw new AppException(
        'Error al actualizar el usuario',
        HttpStatus.INTERNAL_SERVER_ERROR,
        ErrorCodes.USER_UPDATE_FAILED, 
      );
    }
  }

  // ================= DELETE USER =================
  public async deleteUser(id: number): Promise<boolean> {

    const oldUser = await this.prisma.user.findUnique({
      where: { id }
    });

    if (!oldUser) {
      throw new AppException(
        'Usuario no encontrado',
        HttpStatus.NOT_FOUND,
        ErrorCodes.USER_NOT_FOUND_DB,
      );
    }

    try {
      await this.prisma.user.delete({
        where: { id }
      });

      await this.auditLogService.createLog({
        userId: id,
        action: 'DELETE_USER',
        entity: 'USER',
        entityId: id,
        oldValue: oldUser,
      });

      return true;

    } catch (error) {
      throw new AppException(
        'Error al eliminar el usuario',
        HttpStatus.INTERNAL_SERVER_ERROR,
        ErrorCodes.USER_DELETE_FAILED, 
      );
    }
  }

// ================= GET USERS =================
public async getUsersExcept(userId: number): Promise<User[]> {
  try {
    return await this.prisma.user.findMany({
      where: {
        id: {
          not: userId, // <- aquí está la magia
        },
      },
      select: {
        id: true,
        name: true,
        lastname: true,
        username: true,
        created_at: true,
      },
    });
  } catch (error) {
    throw new AppException(
      'Error al obtener los usuarios',
      HttpStatus.INTERNAL_SERVER_ERROR,
      ErrorCodes.DATABASE_ERROR,
    );
  }
}

  // ================= GET USER BY ID =================
  public async getUserById(id: number): Promise<User> {

    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        lastname: true,
        username: true,
        created_at: true
      }
    });

    if (!user) {
      throw new AppException(
        'Usuario no encontrado',
        HttpStatus.NOT_FOUND,
        ErrorCodes.USER_NOT_FOUND_DB,
      );
    }

    return user;
  }
}