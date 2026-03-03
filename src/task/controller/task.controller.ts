import { Body, Controller, Delete, Get, HttpCode, HttpException, HttpStatus, Param, ParseIntPipe, Post, Put } from '@nestjs/common';
import { TaskService } from '../service/task.service'
import { UpdateTaskDto } from '../dto/update-task.dto';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CreateTaskDto } from '../dto/create-task.dto';

@ApiTags('task')
@Controller('api/task')
export class TaskController {
  constructor(private readonly taskSvc: TaskService) {}

  @Get()
  @ApiOperation({ summary: 'Obtener todas las tareas disponibles' })
  public async fetchTasks(): Promise<any[]> {
    return await this.taskSvc.getTasks();
  }

  @Get(":id")
  public async getTaskById(@Param("id", ParseIntPipe) id: number): Promise<any> {
    const task = await this.taskSvc.getTaskById(id);

    if (task) {
      return task;
    } else {
      throw new HttpException('Task not found', HttpStatus.NOT_FOUND);
    }
  }

 @Post()
  public async insertTask(@Body() task: CreateTaskDto): Promise<any> {
    return await this.taskSvc.insertTask(task);
  }

  @Put(':id') 
  public async updateTask(@Param("id", ParseIntPipe) id: number, @Body() UpdateTaskDto: UpdateTaskDto): Promise<any> {
    return await this.taskSvc.updateTask(id, UpdateTaskDto);
  }

  @Delete(':id') 
  @HttpCode(HttpStatus.OK)
  public async deleteTask(@Param("id", ParseIntPipe) id: number): Promise<boolean> {
    const result = await this.taskSvc.deleteTask(id);
    if (!result) 
        throw new HttpException('Task not found', HttpStatus.NOT_FOUND);

    return true;
  }
}
