import { Body, Controller, Delete, Get, HttpCode, HttpException, HttpStatus, Param, ParseIntPipe, Post, Put, UseGuards, Request } from '@nestjs/common';
import { TaskService } from '../service/task.service'
import { UpdateTaskDto } from '../dto/update-task.dto';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CreateTaskDto } from '../dto/create-task.dto';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { Roles } from 'src/common/decorators/role.decorator';

@UseGuards(AuthGuard)
@ApiTags('task')
@Controller('api/task')
export class TaskController {
  constructor(private readonly taskSvc: TaskService) {}

  @Get()
  @UseGuards(AuthGuard)
  @Roles('ADMIN', 'CLIENT')
  @ApiOperation({ summary: 'Obtener todas las tareas del usuario autenticado' })
  public async fetchTasks(@Request() req: any): Promise<any[]> {
    return await this.taskSvc.getTasks(req.user.id);
  }

  @Get(":id")
  @UseGuards(AuthGuard)
  @Roles('ADMIN', 'CLIENT')
  public async getTaskById(@Param("id", ParseIntPipe) id: number, @Request() req: any): Promise<any> {
    const task = await this.taskSvc.getTaskById(id, req.user.id);
    if (task) {
      return task;
    } else {
      throw new HttpException('Task not found', HttpStatus.NOT_FOUND);
    }
  }

  @Post()
  @UseGuards(AuthGuard)
  @Roles('ADMIN', 'CLIENT')
  public async insertTask(@Body() task: CreateTaskDto, @Request() req: any): Promise<any> {
    return await this.taskSvc.insertTask(task, req.user.id);
  }

  @Put(':id')
  @UseGuards(AuthGuard)
  @Roles('ADMIN', 'CLIENT')
  public async updateTask(@Param("id", ParseIntPipe) id: number, @Body() updateTaskDto: UpdateTaskDto, @Request() req: any): Promise<any> {
    return await this.taskSvc.updateTask(id, updateTaskDto, req.user.id);
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  @Roles('ADMIN', 'CLIENT')
  @HttpCode(HttpStatus.OK)
  public async deleteTask(@Param("id", ParseIntPipe) id: number, @Request() req: any): Promise<boolean> {
    const result = await this.taskSvc.deleteTask(id, req.user.id);
    if (!result)
      throw new HttpException('Task not found', HttpStatus.NOT_FOUND);
    return true;
  }
}