import { Inject, Injectable } from "@nestjs/common";
import { CreateTaskDto } from "../dto/create-task.dto";
import { Task } from "../entities/task.entity";
import { UpdateTaskDto } from "../dto/update-task.dto";
import { PrismaService } from "src/common/prisma/prisma.service";

@Injectable()
export class TaskService {

  constructor( 
    private prisma : PrismaService
  ) {}

  public async getTasks(): Promise<Task[]> {
  return await this.prisma.task.findMany();
}

public async getTaskById(id: number): Promise<Task | null> {
  try {
    return await this.prisma.task.findUniqueOrThrow({
      where: { id }
    });
  } catch (error) {
    return null;
  }
}

public async insertTask(task: CreateTaskDto): Promise<Task> {
  return await this.prisma.task.create({
    data: task
  });
}

public async updateTask(id: number, taskUpdated: UpdateTaskDto): Promise<Task> {
  return await this.prisma.task.update({
    where: { id },
    data: taskUpdated
  });
}

public async deleteTask(id: number): Promise<boolean> {
  await this.prisma.task.delete({
    where: { id }
  });
  return true;
}

}