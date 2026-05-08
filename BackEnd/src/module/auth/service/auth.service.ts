import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { UtilService } from '../../../common/services/util.service';
import { AuditLogService } from 'src/module/auditLog/service/audit-log.service';
import { AppException } from 'src/common/exceptions/AppException';
import { ErrorCodes } from 'src/common/exceptions/errorCodes';
import { HttpStatus } from '@nestjs/common';

@Injectable()
export class AuthService {

  constructor(
    private readonly prisma: PrismaService,
    private readonly util: UtilService,
    private readonly auditLog: AuditLogService,
  ) {}

  // ================== HELPERS ==================

  public async getUserByUsername(username: string) {
    return this.prisma.user.findUnique({ where: { username } });
  }

  public async getUserById(id: number) {
    return this.prisma.user.findUnique({ where: { id } });
  }

  public async updateHash(userId: number, hash: string | null) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { hash },
    });
  }

  // ================== LOGIN ==================

  public async login(username: string, password: string) {
    const user = await this.getUserByUsername(username);

    if (!user) {
      throw new AppException(
        'Usuario no encontrado',
        HttpStatus.NOT_FOUND,
        ErrorCodes.USER_NOT_FOUND,
      );
    }

    const valid = await this.util.checkPassword(password, user.password);

    if (!valid) {
      throw new AppException(
        'Credenciales incorrectas',
        HttpStatus.UNAUTHORIZED,
        ErrorCodes.INVALID_CREDENTIALS,
      );
    }

    const access_token = await this.util.generateAccessJWT({
      id: user.id,
      username: user.username,
      role: user.role,
    });

    const refresh_token = await this.util.generateRefreshJWT({
      id: user.id,
      username: user.username,
    });

    const hashRT = await this.util.hash(refresh_token);
    await this.updateHash(user.id, hashRT);

    await this.auditLog.createLog({
      userId: user.id,
      action: 'LOGIN',
      entity: 'AUTH',
      entityId: user.id,
      oldValue: null,  // no había sesión antes
      newValue: {
        username: user.username,
        role: user.role,
        loginAt: new Date().toISOString(),
      },
    });

    return { access_token, refresh_token };
  }

  // ================== REFRESH ==================

public async refresh(refreshToken: string) {

  if (!refreshToken) {

    throw new AppException(
      'Token no proporcionado',
      HttpStatus.UNAUTHORIZED,
      ErrorCodes.UNAUTHORIZED,
    );
  }

  let payload: any;

  // ================= VALIDAR JWT =================

  try {

    payload =
      await this.util.verifyRefreshJWT(refreshToken);

  } catch {

    throw new AppException(
      'Refresh token inválido',
      HttpStatus.UNAUTHORIZED,
      ErrorCodes.INVALID_TOKEN,
    );
  }

  // ================= BUSCAR USUARIO =================

  const user =
    await this.getUserById(payload.id);

  if (!user?.hash) {

    throw new AppException(
      'Usuario no válido',
      HttpStatus.UNAUTHORIZED,
      ErrorCodes.USER_NOT_FOUND_DB,
    );
  }

  // ================= VALIDAR HASH =================

  const isMatch =
    await this.util.checkHash(
      refreshToken,
      user.hash,
    );

  if (!isMatch) {

    throw new AppException(
      'Refresh token inválido',
      HttpStatus.UNAUTHORIZED,
      ErrorCodes.INVALID_TOKEN,
    );
  }

  // ================= GENERAR NUEVOS TOKENS =================

  const access_token =
    await this.util.generateAccessJWT({

      id: user.id,

      username: user.username,

      role: user.role,
    });

  const new_refresh_token =
    await this.util.generateRefreshJWT({

      id: user.id,

      username: user.username,
    });

  // ================= GUARDAR NUEVO HASH =================

  const newHashRT =
    await this.util.hash(new_refresh_token);

  await this.updateHash(
    user.id,
    newHashRT,
  );

  // ================= AUDITORÍA =================

  await this.auditLog.createLog({

    userId: user.id,

    action: 'REFRESH_TOKEN',

    entity: 'AUTH',

    entityId: user.id,

    oldValue: null,

    newValue: {

      refreshedAt:
        new Date().toISOString(),
    },
  });

  // ================= RESPONSE =================

  return {

    access_token,

    refresh_token:
      new_refresh_token,
  };
}
  // ================== LOGOUT ==================

  public async logout(userId: number) {
    const user = await this.getUserById(userId);

    await this.updateHash(userId, null);

    await this.auditLog.createLog({
      userId,
      action: 'LOGOUT',
      entity: 'AUTH',
      entityId: userId,
      oldValue: {
        username: user?.username,
        role: user?.role,
        logoutAt: new Date().toISOString(),
      },
      newValue: null, // sesión cerrada
    });
  }

  // ================== REGISTER ==================

  public async register(data: any) {
    const exists = await this.getUserByUsername(data.username);

    if (exists) {
      throw new AppException(
        'El usuario ya existe',
        HttpStatus.CONFLICT,
        ErrorCodes.USER_ALREADY_EXISTS,
      );
    }

    const hashedPassword = await this.util.hash(data.password);

    const user = await this.prisma.user.create({
      data: {
        name:     data.name,
        lastname: data.lastname,
        username: data.username,
        password: hashedPassword,
        role:     data.role ?? 'CLIENT',
      },
    });

    await this.auditLog.createLog({
      userId:   user.id,
      action:   'REGISTER',
      entity:   'USER',
      entityId: user.id,
      oldValue: null, // no existía antes
      newValue: {
        name:      user.name,
        lastname:  user.lastname,
        username:  user.username,
        role:      user.role,
        createdAt: user.created_at,
      },
    });

    return user;
  }

  // ================== DELETE USER ==================

  public async deleteUser(userId: number) {
    const user = await this.getUserById(userId);

    await this.auditLog.createLog({
      userId,
      action:   'DELETE_USER',
      entity:   'USER',
      entityId: userId,
      oldValue: {
        name:      user?.name,
        lastname:  user?.lastname,
        username:  user?.username,
        role:      user?.role,
        createdAt: user?.created_at,
      },
      newValue: null, // ya no existe
    });

    await this.updateHash(userId, null);

    return this.prisma.user.delete({
      where: { id: userId },
    });
  }

  // ================== UPDATE PROFILE ==================

  public async updateProfile(userId: number, data: any) {
    const user = await this.getUserById(userId);

    if (!user) {
      throw new AppException(
        'Usuario no encontrado',
        HttpStatus.NOT_FOUND,
        ErrorCodes.USER_NOT_FOUND_DB,
      );
    }

    // Capturamos el estado ANTES de actualizar
    const oldValue = {
      name:     user.name,
      lastname: user.lastname,
      username: user.username,
    };

    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: {
        name:     data.name,
        lastname: data.lastname,
        username: data.username,
      },
      select: {
        id:         true,
        name:       true,
        lastname:   true,
        username:   true,
        created_at: true,
      },
    });

    // Capturamos el estado DESPUÉS de actualizar
    const newValue = {
      name:     updated.name,
      lastname: updated.lastname,
      username: updated.username,
    };

    await this.auditLog.createLog({
      userId,
      action:   'UPDATE_PROFILE',
      entity:   'USER',
      entityId: userId,
      oldValue,
      newValue,
    });

    return updated;
  }

  // ================== CHANGE PASSWORD ==================

  public async changePassword(
    userId: number,
    currentPassword: string,
    newPassword: string,
  ) {
    const user = await this.getUserById(userId);

    if (!user) {
      throw new AppException(
        'Usuario no encontrado',
        HttpStatus.NOT_FOUND,
        ErrorCodes.USER_NOT_FOUND_DB,
      );
    }

    const isValid = await this.util.checkPassword(currentPassword, user.password);

    if (!isValid) {
      throw new AppException(
        'Contraseña actual incorrecta',
        HttpStatus.UNAUTHORIZED,
        ErrorCodes.INVALID_PASSWORD,
      );
    }

    const hashed = await this.util.hash(newPassword);

    await this.prisma.user.update({
      where: { id: userId },
      data:  { password: hashed },
    });

    await this.auditLog.createLog({
      userId,
      action:   'CHANGE_PASSWORD',
      entity:   'USER',
      entityId: userId,
      // Nunca guardamos contraseñas, solo indicamos que cambió
      oldValue: { passwordChanged: false },
      newValue: { passwordChanged: true, changedAt: new Date().toISOString() },
    });

    return { message: 'Contraseña actualizada correctamente' };
  }
}