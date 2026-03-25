import { Body, Controller, Delete, Get, HttpException, HttpStatus, Param, ParseIntPipe, Patch, Post, Request, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { ApiOperation } from '@nestjs/swagger';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entity/user.entity';
import { UtilService } from 'src/common/services/util.service';
import { AuthGuard } from 'src/common/guards/auth.guard';

@Controller('api/users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly utilService: UtilService
  ) {}

  @Post()
  @ApiOperation({ summary: 'Registrar un nuevo usuario' })
  public async insertUser(@Body() user: CreateUserDto): Promise<any> {
    try {
      user.password = await this.utilService.hash(user.password);
      return await this.usersService.insertUser(user);
    } catch (error) {
      throw new HttpException('Error creating user', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @UseGuards(AuthGuard)
  @Get('profile')
  @ApiOperation({ summary: 'Obtener perfil del usuario autenticado' })
  public async getProfile(@Request() req: any): Promise<any> {
    return await this.usersService.getUserById(req.user.id);
  }

  @UseGuards(AuthGuard)
  @Patch('profile')
  @ApiOperation({ summary: 'Actualizar perfil del usuario autenticado' })
  public async updateProfile(@Request() req: any, @Body() updateUserDto: UpdateUserDto): Promise<User> {
    try {
      if (updateUserDto.password) {
        updateUserDto.password = await this.utilService.hash(updateUserDto.password);
      }
      return await this.usersService.updateUser(req.user.id, updateUserDto);
    } catch (error) {
      throw new HttpException('Error updating user', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @UseGuards(AuthGuard)
  @Delete('profile')
  @ApiOperation({ summary: 'Eliminar cuenta del usuario autenticado' })
  public async deleteProfile(@Request() req: any): Promise<any> {
    try {
      return await this.usersService.deleteUser(req.user.id);
    } catch (error) {
      throw new HttpException('Error deleting user', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}