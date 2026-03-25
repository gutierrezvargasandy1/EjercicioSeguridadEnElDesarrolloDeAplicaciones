import { Body, Controller, Get, HttpCode, HttpStatus, Post, Req, UnauthorizedException, UseGuards } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import { AuthDto } from './dto/auth.dto';
import { UtilService } from 'src/common/services/util.service';
import { AuthGuard } from 'src/common/guards/auth.guard';

@Controller('api/auth')
export class AuthController {
  constructor(private readonly utilSvc: UtilService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verifica las credenciales y genera un JWT' })
  public async logIn(@Body() auth: AuthDto) {
    return await this.utilSvc.login(auth.username, auth.password);
  }

  @Get('me')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Extrae el id del usuario desde el token y busca la información del usuario' })
  public async getProfile(@Req() request: any) {
    return request['user'];
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Genera un nuevo JWT utilizando un token de actualización válido' })
  public async refresh(@Body('refresh_token') refreshToken: string) {
    return await this.utilSvc.refresh(refreshToken);
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Invalida el token de acceso actual y el token de actualización' })
  public async logOut(@Req() req: any) {
    await this.utilSvc.logout(req.user.id);
    return { message: 'Sesión cerrada correctamente' };
  }
}