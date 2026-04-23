import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { User } from '../entities/user.entity';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { UtilService } from 'src/common/services/util.service';
import { AuditLogService } from 'src/module/auditLog/service/audit-log.service';

@Injectable()
export class UsersService {

  constructor(
    private prisma: PrismaService,
    private util: UtilService,
    private auditLogService: AuditLogService, 
  ) {}

  // ================= CREATE USER + AUDIT =================
  public async insertUser(user: CreateUserDto): Promise<User> {

    const created = await this.prisma.user.create({
      data: {
        ...user,
        password: await this.util.hash(user.password),
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
      entityId: created.id,
      newValue: created,
    });

    return created;
  }

  // ================= UPDATE USER + AUDIT =================
  public async updateUser(
    id: number,
    userUpdated: UpdateUserDto
  ): Promise<User> {

    const oldUser = await this.prisma.user.findUnique({
      where: { id }
    });

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
  }

  // ================= DELETE USER + AUDIT =================
  public async deleteUser(id: number): Promise<boolean> {

    const oldUser = await this.prisma.user.findUnique({
      where: { id }
    });

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
  }

  // ================= GET USERS =================
  public async getUsers(): Promise<User[]> {
    return await this.prisma.user.findMany({
      select: {
        id: true,
        name: true,
        lastname: true,
        username: true,
        created_at: true
      }
    });
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
      throw new Error('User not found');
    }

    return user;
  }
}