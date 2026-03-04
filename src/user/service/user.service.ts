import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { CreateUserDto } from "../dto/create-user.dto";
import { UpdateUserDto } from "../dto/update-user.dto";

@Injectable()
export class UserService {

  constructor(private prisma: PrismaService) {}

  // 🔹 Obtener todos
  async getUsers() {
    return this.prisma.user.findMany({
      include: { tasks: true } // incluye las tareas relacionadas
    });
  }

  // 🔹 Obtener por ID
  async getUserById(id: number) {

    const user = await this.prisma.user.findUnique({
      where: { id },
      include: { tasks: true }
    });

    if (!user) {
      throw new NotFoundException('User no encontrado');
    }

    return user;
  }

  // 🔹 Insertar
  async insertUser(createUserDto: CreateUserDto) {
    return this.prisma.user.create({
      data: createUserDto
    });
  }

  // 🔹 Actualizar
  async updateUser(id: number, updateUserDto: UpdateUserDto) {

    await this.getUserById(id);

    return this.prisma.user.update({
      where: { id },
      data: updateUserDto
    });
  }

  // 🔹 Eliminar
  async deleteUser(id: number) {

    await this.getUserById(id);

    await this.prisma.user.delete({
      where: { id }
    });

    return { message: 'User eliminado correctamente' };
  }
}