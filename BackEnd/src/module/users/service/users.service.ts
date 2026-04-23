import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { User } from '../entity/user.entity';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { UtilService } from 'src/common/services/util.service';

@Injectable()
export class UsersService {

  constructor(private prisma: PrismaService,
              private util: UtilService
              
  ) {}


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

  const data: any = { ...userUpdated };

  if (data.password) {
    data.password = await this.util.hash(data.password);
  }

  return await this.prisma.user.update({
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
}

  public async deleteUser(id: number): Promise<boolean> {
    await this.prisma.user.delete({
      where: { id }
    });
    return true;
  }

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