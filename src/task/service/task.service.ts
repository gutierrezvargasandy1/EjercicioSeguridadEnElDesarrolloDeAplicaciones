import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { CreateTaskDto } from "../dto/create-task.dto";
import { UpdateTaskDto } from "../dto/update-task.dto";

@Injectable()
export class TaskService {

  constructor(private prisma: PrismaService) {}

  // 🔹 Obtener todas
  async getTasks() {
    return this.prisma.task.findMany();
  }

  // 🔹 Obtener por ID
  async getTaskById(id: number) {
    const task = await this.prisma.task.findUnique({
      where: { id }
    });

    if (!task) {
      throw new NotFoundException('Task no encontrada');
    }

    return task;
  }

  // 🔹 Insertar
  async insertTask(createTaskDto: CreateTaskDto) {
    return this.prisma.task.create({
      data: createTaskDto
    });
  }

  // 🔹 Actualizar
  async updateTask(id: number, updateTaskDto: UpdateTaskDto) {

    await this.getTaskById(id);

    return this.prisma.task.update({
      where: { id },
      data: updateTaskDto
    });
  }

  // 🔹 Eliminar
  async deleteTask(id: number) {

    await this.getTaskById(id);

    await this.prisma.task.delete({
      where: { id }
    });

    return { message: 'Task eliminada correctamente' };
  }
}