import { Body, Controller, Get, HttpCode, HttpException, HttpStatus, Post, Req, UnauthorizedException, UseGuards } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import { AuthDto } from './dto/auth.dto';
import { UtilService } from 'src/common/services/util.service';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { Res } from '@nestjs/common';
import {AuthService} from './auth.service'
import { CreateUserDto } from 'src/module/users/dto/create-user.dto';
import { UsersService } from 'src/module/users/users.service';

@Controller('api/auth')
export class AuthController {
  constructor(private readonly utilSvc: UtilService, private readonly authServices: AuthService, private readonly usersService: UsersService, private readonly utilService: UtilService) {}

@Post('login')
@HttpCode(HttpStatus.OK)
@ApiOperation({ summary: 'Verifica las credenciales y genera un JWT' })
public async logIn(
  @Body() auth: AuthDto,
  @Res({ passthrough: true }) res
) {
  const { access_token, refresh_token } =
    await this.utilSvc.login(auth.username, auth.password);

  res.cookie('refreshToken', refresh_token, {
    httpOnly: true,
    secure: false, 
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000 
  });

  return { access_token };
}


@Get('me')
@UseGuards(AuthGuard)
public async getProfile(@Req() request: any) {
  const user = request.user;

  return this.authServices.getUserById(user.id);
}


@Post('refresh')
@HttpCode(HttpStatus.OK)
@ApiOperation({ summary: 'Genera un nuevo JWT utilizando un token de actualización válido' })
public async refresh(
  @Req() req,
  @Res({ passthrough: true }) res
) {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    throw new UnauthorizedException('No refresh token');
  }

  const { access_token, refresh_token } =
    await this.utilSvc.refresh(refreshToken);

  res.cookie('refreshToken', refresh_token, {
    httpOnly: true,
    secure: false, 
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000 
  });

  return { access_token };
}


@Post('logout')
@HttpCode(HttpStatus.OK)
@ApiOperation({ summary: 'Invalida la sesión del usuario' })
public async logOut(
  @Req() req: any,
  @Res({ passthrough: true }) res
) {
  const refreshToken = req.cookies.refreshToken;

  if (refreshToken) {
    try {
      const payload = await this.utilSvc.verifyJWT(refreshToken);
      await this.utilSvc.logout(payload.sub);
    } catch (error) {
    }
  }

  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: false, 
    sameSite: 'strict'
  });

  return { message: 'Sesión cerrada correctamente' };
}


  @Post('register')
  @ApiOperation({ summary: 'Registrar un nuevo usuario' })
  public async insertUser(@Body() user: CreateUserDto): Promise<any> {
    try {
      user.password = await this.utilService.hash(user.password);
      return await this.usersService.insertUser(user);
    } catch (error) {
      throw new HttpException('Error creating user', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }


}