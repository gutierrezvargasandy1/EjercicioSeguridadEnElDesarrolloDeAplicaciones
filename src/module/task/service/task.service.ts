import { Injectable } from "@nestjs/common";
import { CreateTaskDto } from "../dto/create-task.dto";
import { Task } from "../entities/task.entity";
import { UpdateTaskDto } from "../dto/update-task.dto";
import { PrismaService } from "src/common/prisma/prisma.service";

@Injectable()
export class TaskService {

  constructor(private prisma: PrismaService) {}

  public async getTasks(userId: number): Promise<Task[]> {
    return await this.prisma.task.findMany({
      where: { user_id: userId }  // 👈 solo las del usuario
    });
  }

  public async getTaskById(id: number, userId: number): Promise<Task | null> {
    try {
      return await this.prisma.task.findUniqueOrThrow({
        where: { id, user_id: userId }  // 👈 verifica que sea suya
      });
    } catch (error) {
      return null;
    }
  }

  public async insertTask(task: CreateTaskDto, userId: number): Promise<Task> {
    return await this.prisma.task.create({
      data: {
        ...task,
        user_id: userId  // 👈 asigna el usuario autenticado
      }
    });
  }

  public async updateTask(id: number, taskUpdated: UpdateTaskDto, userId: number): Promise<Task> {
    return await this.prisma.task.update({
      where: { id, user_id: userId },  // 👈 solo si es suya
      data: taskUpdated
    });
  }

  public async deleteTask(id: number, userId: number): Promise<boolean> {
    try {
      await this.prisma.task.delete({
        where: { id, user_id: userId }  // 👈 solo si es suya
      });
      return true;
    } catch (error) {
      return false;
    }
  }
}