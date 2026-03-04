import { Body, Controller, Delete, Get, HttpCode, HttpException, HttpStatus, Param, ParseIntPipe, Post, Put } from '@nestjs/common';
import { UserService } from '../service/user.service';
import { UpdateUserDto } from '../dto/update-user.dto';
import { CreateUserDto } from '../dto/create-user.dto';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('user')
@Controller('api/user')
export class UserController {

  constructor(private readonly userSvc: UserService) {}

  @Get()
  @ApiOperation({ summary: 'Obtener todos los usuarios' })
  public async fetchUsers(): Promise<any[]> {
    return await this.userSvc.getUsers();
  }

  @Get(":id")
  public async getUserById(@Param("id", ParseIntPipe) id: number): Promise<any> {
    return await this.userSvc.getUserById(id);
  }

  @Post()
  public async insertUser(@Body() user: CreateUserDto): Promise<any> {
    return await this.userSvc.insertUser(user);
  }

  @Put(':id')
  public async updateUser(
    @Param("id", ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto
  ): Promise<any> {
    return await this.userSvc.updateUser(id, updateUserDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  public async deleteUser(@Param("id", ParseIntPipe) id: number): Promise<any> {
    return await this.userSvc.deleteUser(id);
  }
}