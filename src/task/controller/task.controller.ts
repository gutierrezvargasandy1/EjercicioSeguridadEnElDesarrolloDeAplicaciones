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
    try {
      return await this.taskSvc.getTasks();
    } catch (error) {
      throw new HttpException('Error fetching tasks', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get(":id")
  public async getTaskById(@Param("id", ParseIntPipe) id: number): Promise<any> {
    try {
      const task = await this.taskSvc.getTaskById(id);
      if (task) {
        return task;
      } else {
        throw new HttpException('Task not found', HttpStatus.NOT_FOUND);
      }
    } catch (error) {
      throw new HttpException('Task not found', HttpStatus.NOT_FOUND);
    }
  }

  @Post()
  public async insertTask(@Body() task: CreateTaskDto): Promise<any> {
    try {
      return await this.taskSvc.insertTask(task);
    } catch (error) {
      throw new HttpException('Error creating task', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Put(':id') 
  public async updateTask(@Param("id", ParseIntPipe) id: number, @Body() updateTaskDto: UpdateTaskDto): Promise<any> {
    try {
      return await this.taskSvc.updateTask(id, updateTaskDto);
    } catch (error) {
      throw new HttpException('Task not found', HttpStatus.NOT_FOUND);
    }
  }

  @Delete(':id') 
  @HttpCode(HttpStatus.OK)
  public async deleteTask(@Param("id", ParseIntPipe) id: number): Promise<boolean> {
    try {
      await this.taskSvc.deleteTask(id);
      return true;
    } catch (error) {
      throw new HttpException('Task not found', HttpStatus.NOT_FOUND);
    }
  }
}
