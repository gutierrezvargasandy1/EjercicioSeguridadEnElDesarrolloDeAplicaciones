import { Injectable, HttpStatus } from "@nestjs/common";
import { CreateTaskDto } from "../dto/create-task.dto";
import { UpdateTaskDto } from "../dto/update-task.dto";
import { Task } from "../entities/task.entity";
import { PrismaService } from "src/common/prisma/prisma.service";
import { AuditLogService } from "src/module/auditLog/service/audit-log.service";
import { AppException } from "src/common/exceptions/AppException";
import { ErrorCodes } from "src/common/exceptions/errorCodes";

@Injectable()
export class TaskService {

  constructor(
    private prisma: PrismaService,
    private auditLogService: AuditLogService,
  ) {}

  // ================= GET TASKS =================
  public async getTasks(userId: number): Promise<Task[]> {
    return this.prisma.task.findMany({
      where: { user_id: userId },
      orderBy: { created_at: 'desc' }
    });
  }

  // ================= GET TASK BY ID =================
  public async getTaskById(id: number, userId: number): Promise<Task | null> {
    const task = await this.prisma.task.findFirst({
      where: { id, user_id: userId }
    });

    if (!task) {
      throw new AppException(
        'Tarea no encontrada',
        HttpStatus.NOT_FOUND,
        ErrorCodes.TASK_NOT_FOUND,
      );
    }

    return task;
  }

  // ================= CREATE TASK =================
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
        oldValue: null,
        entityId: created.id,
        newValue: created,
      });

      return created;

    } catch (error) {
      throw new AppException(
        'Error al crear la tarea',
        HttpStatus.INTERNAL_SERVER_ERROR,
        ErrorCodes.TASK_CREATE_FAILED,
      );
    }
  }

  // ================= UPDATE TASK =================
  public async updateTask(
    id: number,
    taskUpdated: UpdateTaskDto,
    userId: number
  ): Promise<Task> {

    const task = await this.prisma.task.findFirst({
      where: { id, user_id: userId }
    });

    if (!task) {
      throw new AppException(
        'Tarea no encontrada',
        HttpStatus.NOT_FOUND,
        ErrorCodes.TASK_NOT_FOUND,
      );
    }

    try {
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

    } catch (error) {
      throw new AppException(
        'Error al actualizar la tarea',
        HttpStatus.INTERNAL_SERVER_ERROR,
        ErrorCodes.TASK_UPDATE_FAILED,
      );
    }
  }

  // ================= DELETE TASK =================
  public async deleteTask(id: number, userId: number): Promise<boolean> {

    const task = await this.prisma.task.findFirst({
      where: { id, user_id: userId }
    });

    if (!task) {
      throw new AppException(
        'Tarea no encontrada',
        HttpStatus.NOT_FOUND,
        ErrorCodes.TASK_NOT_FOUND,
      );
    }

    try {
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

    } catch (error) {
      throw new AppException(
        'Error al eliminar la tarea',
        HttpStatus.INTERNAL_SERVER_ERROR,
        ErrorCodes.TASK_DELETE_FAILED,
      );
    }
  }
}