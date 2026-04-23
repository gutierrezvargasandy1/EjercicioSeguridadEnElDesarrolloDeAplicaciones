import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { UtilService } from '../../../common/services/util.service';

@Injectable()
export class AuthService {

  constructor(
    private readonly prisma: PrismaService,
    private readonly util: UtilService,
  ) { }

  // ================== HELPERS USER ==================

  public async getUserByUsername(username: string) {
    return await this.prisma.user.findUnique({
      where: { username }
    });
  }

  public async getUserById(id: number) {
    return await this.prisma.user.findUnique({
      where: { id }
    });
  }

  public async updateHash(userId: number, hash: string | null) {
    await this.prisma.user.update({
      where: { id: userId },
      data: { hash }
    });
  }

  // ================== LOGIN ==================

  public async login(
    username: string,
    password: string
  ): Promise<{ access_token: string; refresh_token: string }> {

    const user = await this.getUserByUsername(username);
    if (!user) {
      throw new UnauthorizedException('Usuario no encontrado');
    }

    const valid = await this.util.checkPassword(password, user.password);
    if (!valid) {
      throw new UnauthorizedException('Contraseña incorrecta');
    }

    const accessPayload = {
      id: user.id,
      username: user.username,
      role: user.role
    };

    const refreshPayload = {
      id: user.id,
      username: user.username
    };

    const accessToken = await this.util.generateAccessJWT(accessPayload);
    const refreshToken = await this.util.generateRefreshJWT(refreshPayload);

    const hashRT = await this.util.hash(refreshToken);
    await this.updateHash(user.id, hashRT);

    return {
      access_token: accessToken,
      refresh_token: refreshToken
    };
  }

  // ================== REFRESH ==================

  public async refresh(
    refreshToken: string
  ): Promise<{ access_token: string; refresh_token: string }> {

    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token no proporcionado');
    }

    const payload = await this.util.verifyRefreshJWT(refreshToken);

    const user = await this.getUserById(payload.id);

    if (!user?.hash) {
      throw new UnauthorizedException('Usuario no válido');
    }

    const isMatch = await this.util.checkHash(refreshToken, user.hash);
    if (!isMatch) {
      throw new UnauthorizedException('Refresh token inválido');
    }

    const accessPayload = {
      id: user.id,
      username: user.username,
      role: user.role
    };

    const refreshPayload = {
      id: user.id,
      username: user.username
    };

    const newAccessToken = await this.util.generateAccessJWT(accessPayload);
    const newRefreshToken = await this.util.generateRefreshJWT(refreshPayload);

    const newHashRT = await this.util.hash(newRefreshToken);
    await this.updateHash(user.id, newHashRT);

    return {
      access_token: newAccessToken,
      refresh_token: newRefreshToken
    };
  }

  // ================== LOGOUT ==================

  public async logout(userId: number): Promise<void> {
    await this.updateHash(userId, null);
  }

  // ================== REGISTER ==================

  public async register(data: any) {
    const hashedPassword = await this.util.hash(data.password);

    return await this.prisma.user.create({
      data: {
        name: data.name,
        lastname: data.lastname,
        username: data.username,
        password: hashedPassword,
        role: data.role ?? 'CLIENT'
      }
    });
  }


  // ================== DELETE USER (SELF) ==================

  public async deleteUser(userId: number) {
    await this.updateHash(userId, null);

    return await this.prisma.user.delete({
      where: { id: userId }
    });
  }


  // ================== UPDATE PROFILE (SELF) ==================

public async updateProfile(userId: number, data: any) {

  const user = await this.getUserById(userId);

  if (!user) {
    throw new UnauthorizedException('Usuario no encontrado');
  }

  return await this.prisma.user.update({
    where: { id: userId },
    data: {
      name: data.name,
      lastname: data.lastname,
      username: data.username
    },
    select: {
      id: true,
      name: true,
      lastname: true,
      username: true,
      created_at: true
    }
  });
}

  public async changePassword(
    userId: number,
    currentPassword: string,
    newPassword: string
  ) {

    const user = await this.getUserById(userId);

    if (!user) {
      throw new UnauthorizedException('Usuario no encontrado');
    }

    const isValid = await this.util.checkPassword(
      currentPassword,
      user.password
    );

    if (!isValid) {
      throw new UnauthorizedException('Contraseña actual incorrecta');
    }

    const hashed = await this.util.hash(newPassword);

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        password: hashed
      }
    });

    return { message: 'Contraseña actualizada correctamente' };
  }
}