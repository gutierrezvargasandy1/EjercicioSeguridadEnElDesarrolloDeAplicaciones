import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { User } from 'src/module/users/entity/user.entity';

@Injectable()
export class AuthService {
  constructor(private readonly prisma : PrismaService) {}

  public async getUserByUsername(username: string) : Promise<User | null>{
    return await this.prisma.user.findFirst({ 
      where: { username } 
    });
  }

    public async getUserById(id: number) : Promise<User | null>{
    return await this.prisma.user.findFirst({ 
      where: { id } 
    });
  }

  public logIn(): string {
    return 'Sesión exitosa';
  }

  public async updateHash(user_id: number,hash: string | null ){
    return await this.prisma.user.update({
      where: {id: user_id },
      data:{hash} as any
    });

  }

}