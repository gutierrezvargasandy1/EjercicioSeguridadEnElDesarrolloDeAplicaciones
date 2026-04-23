import { Injectable, HttpException, HttpStatus } from "@nestjs/common";
import { CreateTaskDto } from "../dto/create-task.dto";
import { UpdateTaskDto } from "../dto/update-task.dto";
import { Task } from "../entities/task.entity";
import { PrismaService } from "src/common/prisma/prisma.service";
import { AuditLogService } from "src/module/auditLog/service/audit-log.service";

@Injectable()
export class TaskService {

  constructor(
    private prisma: PrismaService,
    private auditLogService: AuditLogService, 
  ) {}

  // ================= GET TASKS =================
  public async getTasks(userId: number): Promise<Task[]> {
    return await this.prisma.task.findMany({
      where: { user_id: userId },
      orderBy: { created_at: 'desc' }
    });
  }

  // ================= GET TASK BY ID =================
  public async getTaskById(id: number, userId: number): Promise<Task | null> {
    return await this.prisma.task.findFirst({
      where: { id, user_id: userId }
    });
  }

  // ================= CREATE TASK + AUDIT =================
  public async insertTask(task: CreateTaskDto, userId: number): Promise<Task> {
    try {

      const created = await this.prisma.task.create({
        data: {
          name: task.name,
          description: task.description || "",
          priority: task.priority ?? false,
          user_id: userId
        }
      });

      await this.auditLogService.createLog({
        userId,
        action: 'CREATE_TASK',
        entity: 'TASK',
        entityId: created.id,
        newValue: created,
      });

      return created;

    } catch (error) {
      console.error('Error creando tarea:', error);
      throw new HttpException('Error al crear la tarea', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // ================= UPDATE TASK + AUDIT =================
  public async updateTask(
    id: number,
    taskUpdated: UpdateTaskDto,
    userId: number
  ): Promise<Task> {

    const task = await this.prisma.task.findFirst({
      where: { id, user_id: userId }
    });

    if (!task) {
      throw new HttpException('Task not found', HttpStatus.NOT_FOUND);
    }

    const updated = await this.prisma.task.update({
      where: { id: task.id },
      data: {
        ...taskUpdated,
        description: taskUpdated.description ?? task.description,
        priority: taskUpdated.priority ?? task.priority
      }
    });

    await this.auditLogService.createLog({
      userId,
      action: 'UPDATE_TASK',
      entity: 'TASK',
      entityId: task.id,
      oldValue: task,
      newValue: updated,
    });

    return updated;
  }

  // ================= DELETE TASK + AUDIT =================
  public async deleteTask(id: number, userId: number): Promise<boolean> {

    const task = await this.prisma.task.findFirst({
      where: { id, user_id: userId }
    });

    if (!task) {
      throw new HttpException('Task not found', HttpStatus.NOT_FOUND);
    }

    await this.prisma.task.delete({
      where: { id: task.id }
    });

    await this.auditLogService.createLog({
      userId,
      action: 'DELETE_TASK',
      entity: 'TASK',
      entityId: task.id,
      oldValue: task,
    });

    return true;
  }
}