import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { User } from './entity/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {

  constructor(private prisma: PrismaService) {}

  public async getUserById(id: number): Promise<User> {
    try {
      return await this.prisma.user.findUniqueOrThrow({
        where: { id },
        select: {
          id: true,
          name: true,
          lastname: true,
          username: true,
          password: false,
          created_at: true
        }
      });
    } catch (error) {
      throw new Error('Usuario no encontrado');
    }
  }

  public async insertUser(user: CreateUserDto): Promise<User> {
    return await this.prisma.user.create({
      data: user,
      select: {
        id: true,
        name: true,
        lastname: true,
        username: true,
        password: false,
        created_at: true
      }
    });
  }

  public async updateUser(id: number, userUpdated: UpdateUserDto): Promise<User> {
    return await this.prisma.user.update({
      where: { id },
      data: userUpdated,
      select: {
        id: true,
        name: true,
        lastname: true,
        username: true,
        password: false,
        created_at: true
      }
    });
  }

  public async deleteUser(id: number): Promise<boolean> {
    await this.prisma.user.delete({
      where: { id }
    });
    return true;
  }
}