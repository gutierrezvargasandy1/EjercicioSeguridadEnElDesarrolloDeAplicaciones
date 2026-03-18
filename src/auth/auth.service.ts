import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { User } from 'src/users/entity/user.entity';

@Injectable()
export class AuthService {
  constructor(private readonly prisma : PrismaService) {}

  public async getUserByUsername(username: string) : Promise<User | null>{
    return await this.prisma.user.findFirst({ 
      where: { username } 
    });
  }

  public logIn(): string {
    return 'Sesión exitosa';
  }

}