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

  // ================= GET USERNAME =================

  public async getUserByUsername(username: string) {
    return this.prisma.user.findUnique({
      where: { username }
    });
  }

  // ================= CREATE USER =================

  public async insertUser(user: CreateUserDto): Promise<User> {

    const exists = await this.getUserByUsername(user.username);

    if (exists) {
      throw new AppException(
        'El usuario ya existe',
        HttpStatus.CONFLICT,
        ErrorCodes.USER_ALREADY_EXISTS,
      );
    }

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


public async updateUser(
  id: number,
  userUpdated: UpdateUserDto
): Promise<User> {

  // ================= VALIDAR USUARIO EXISTE =================

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

  // ================= VALIDAR USERNAME DUPLICADO =================

  if (userUpdated.username) {

    const existingUser =
      await this.prisma.user.findFirst({

        where: {

          username: userUpdated.username,

          NOT: {
            id
          }
        }
      });

    if (existingUser) {

      throw new AppException(
        'El usuario ya existe',
        HttpStatus.CONFLICT,
        ErrorCodes.USER_ALREADY_EXISTS,
      );
    }
  }

  // ================= UPDATE =================

  try {

    const updated =
      await this.prisma.user.update({

        where: { id },

        data: {
          name: userUpdated.name,
          lastname: userUpdated.lastname,
          username: userUpdated.username,
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

  // ================= VALIDAR TAREAS =================

  const tasksCount = await this.prisma.task.count({
    where: {
      user_id: id
    }
  });

  if (tasksCount > 0) {
    throw new AppException(
      'No se puede eliminar el usuario porque tiene tareas asignadas',
      HttpStatus.CONFLICT,
      ErrorCodes.USER_HAS_TASKS,
    );
  }

  try {

    await this.auditLogService.createLog({

      userId: id,

      action: 'DELETE_USER',

      entity: 'USER',

      entityId: id,

      oldValue: oldUser,
    });

    await this.prisma.user.delete({
      where: { id }
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