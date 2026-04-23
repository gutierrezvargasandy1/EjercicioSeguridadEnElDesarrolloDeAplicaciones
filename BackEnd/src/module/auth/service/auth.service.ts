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

    const accessPayload = {
      id: user.id,
      username: user.username,
      role: user.role,
    };

    const refreshPayload = {
      id: user.id,
      username: user.username,
    };

    const access_token = await this.util.generateAccessJWT(accessPayload);
    const refresh_token = await this.util.generateRefreshJWT(refreshPayload);

    const hashRT = await this.util.hash(refresh_token);
    await this.updateHash(user.id, hashRT);

    await this.auditLog.createLog({
      userId: user.id,
      action: 'LOGIN',
      entity: 'AUTH',
      entityId: user.id,
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

    const payload = await this.util.verifyRefreshJWT(refreshToken);

    const user = await this.getUserById(payload.id);

    if (!user?.hash) {
      throw new AppException(
        'Usuario no válido',
        HttpStatus.UNAUTHORIZED,
        ErrorCodes.USER_NOT_FOUND_DB,
      );
    }

    const isMatch = await this.util.checkHash(refreshToken, user.hash);

    if (!isMatch) {
      throw new AppException(
        'Refresh token inválido',
        HttpStatus.UNAUTHORIZED,
        ErrorCodes.INVALID_TOKEN,
      );
    }

    const accessPayload = {
      id: user.id,
      username: user.username,
      role: user.role,
    };

    const refreshPayload = {
      id: user.id,
      username: user.username,
    };

    const access_token = await this.util.generateAccessJWT(accessPayload);
    const new_refresh_token = await this.util.generateRefreshJWT(refreshPayload);

    const newHashRT = await this.util.hash(new_refresh_token);
    await this.updateHash(user.id, newHashRT);

    await this.auditLog.createLog({
      userId: user.id,
      action: 'REFRESH_TOKEN',
      entity: 'AUTH',
      entityId: user.id,
    });

    return {
      access_token,
      refresh_token: new_refresh_token,
    };
  }

  // ================== LOGOUT ==================

  public async logout(userId: number) {

    await this.updateHash(userId, null);

    await this.auditLog.createLog({
      userId,
      action: 'LOGOUT',
      entity: 'AUTH',
      entityId: userId,
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
        name: data.name,
        lastname: data.lastname,
        username: data.username,
        password: hashedPassword,
        role: data.role ?? 'CLIENT',
      },
    });

    await this.auditLog.createLog({
      userId: user.id,
      action: 'REGISTER',
      entity: 'USER',
      entityId: user.id,
    });

    return user;
  }

  // ================== DELETE USER ==================

  public async deleteUser(userId: number) {

    await this.updateHash(userId, null);

    const deleted = await this.prisma.user.delete({
      where: { id: userId },
    });

    await this.auditLog.createLog({
      userId,
      action: 'DELETE_USER',
      entity: 'USER',
      entityId: userId,
    });

    return deleted;
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

    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: {
        name: data.name,
        lastname: data.lastname,
        username: data.username,
      },
      select: {
        id: true,
        name: true,
        lastname: true,
        username: true,
        created_at: true,
      },
    });

    await this.auditLog.createLog({
      userId,
      action: 'UPDATE_PROFILE',
      entity: 'USER',
      entityId: userId,
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

    const isValid = await this.util.checkPassword(
      currentPassword,
      user.password,
    );

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
      data: {
        password: hashed,
      },
    });

    await this.auditLog.createLog({
      userId,
      action: 'CHANGE_PASSWORD',
      entity: 'USER',
      entityId: userId,
    });

    return { message: 'Contraseña actualizada correctamente' };
  }
}