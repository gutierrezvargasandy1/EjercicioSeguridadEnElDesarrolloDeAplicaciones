import { Body, Controller, Delete, Get, HttpException, HttpStatus, Param, ParseIntPipe, Patch, Post, Request, UseGuards } from '@nestjs/common';
import { UsersService } from '../service/users.service';
import { ApiOperation } from '@nestjs/swagger';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { User } from '../entities/user.entity';
import { UtilService } from 'src/common/services/util.service';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { Roles } from 'src/common/decorators/role.decorator';

@Controller('api/users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly utilService: UtilService
  ) {}

  @Post()
  @UseGuards(AuthGuard)
  @Roles('ADMIN')
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
@Get()
@Roles('ADMIN')
@ApiOperation({ summary: 'Obtener todos los usuarios excepto el autenticado' })
public async getUsers(@Request() req): Promise<User[]> {
  try {
    const currentUserId = req.user.id; // viene del JWT
    return await this.usersService.getUsersExcept(currentUserId);
  } catch (error) {
    throw new HttpException('Error fetching users', HttpStatus.INTERNAL_SERVER_ERROR);
  }
}

@UseGuards(AuthGuard)
@Delete(':id')
@Roles('ADMIN')
@ApiOperation({ summary: 'Eliminar usuario por ID' })
public async deleteUser(
  @Param('id', ParseIntPipe) id: number
): Promise<any> {
  try {
    return await this.usersService.deleteUser(id);
  } catch (error) {
    throw new HttpException('Error deleting user', HttpStatus.INTERNAL_SERVER_ERROR);
  }
}

@UseGuards(AuthGuard)
@Get(':id')
@Roles('ADMIN')
@ApiOperation({ summary: 'Obtener usuario por ID' })
public async getUserById(
  @Param('id', ParseIntPipe) id: number
): Promise<User> {
  try {
    return await this.usersService.getUserById(id);
  } catch (error) {
    throw new HttpException('User not found', HttpStatus.NOT_FOUND);
  }
}

@UseGuards(AuthGuard)
@Patch(':id')
@Roles('ADMIN')
@ApiOperation({ summary: 'Actualizar usuario por ID' })
public async updateUserById(
  @Param('id', ParseIntPipe) id: number,
  @Body() updateUserDto: UpdateUserDto
): Promise<User> {
  try {
    return await this.usersService.updateUser(id, updateUserDto);
  } catch (error) {
    throw new HttpException('Error updating user', HttpStatus.INTERNAL_SERVER_ERROR);
  }
}
}