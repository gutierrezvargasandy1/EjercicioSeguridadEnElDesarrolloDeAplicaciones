import { Injectable, HttpException, HttpStatus } from "@nestjs/common";
import { CreateTaskDto } from "../dto/create-task.dto";
import { UpdateTaskDto } from "../dto/update-task.dto";
import { Task } from "../entities/task.entity";
import { PrismaService } from "src/common/prisma/prisma.service";

@Injectable()
export class TaskService {
  constructor(private prisma: PrismaService) {}

  // Obtener todas las tareas del usuario
  public async getTasks(userId: number): Promise<Task[]> {
    return await this.prisma.task.findMany({
      where: { user_id: userId },
      orderBy: { created_at: 'desc' }
    });
  }

  // Obtener tarea por ID
  public async getTaskById(id: number, userId: number): Promise<Task | null> {
    return await this.prisma.task.findFirst({
      where: { id, user_id: userId }
    });
  }

  // Crear nueva tarea
  public async insertTask(task: CreateTaskDto, userId: number): Promise<Task> {
    try {
      return await this.prisma.task.create({
        data: {
          name: task.name,
          description: task.description || "", // nunca null
          priority: task.priority ?? false,
          user_id: userId
        }
      });
    } catch (error) {
      console.error('Error creando tarea:', error);
      throw new HttpException('Error al crear la tarea', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // Actualizar tarea
  public async updateTask(id: number, taskUpdated: UpdateTaskDto, userId: number): Promise<Task> {
    const task = await this.prisma.task.findFirst({
      where: { id, user_id: userId }
    });
    if (!task) throw new HttpException('Task not found', HttpStatus.NOT_FOUND);

    return await this.prisma.task.update({
      where: { id: task.id },
      data: {
        ...taskUpdated,
        description: taskUpdated.description ?? task.description, // nunca null
        priority: taskUpdated.priority ?? task.priority
      }
    });
  }

  // Borrar tarea
  public async deleteTask(id: number, userId: number): Promise<boolean> {
    const task = await this.prisma.task.findFirst({
      where: { id, user_id: userId }
    });
    if (!task) throw new HttpException('Task not found', HttpStatus.NOT_FOUND);

    await this.prisma.task.delete({ where: { id: task.id } });
    return true;
  }
}
