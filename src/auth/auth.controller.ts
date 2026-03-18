import { Body, Controller, Get, HttpCode, HttpStatus, Post, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiOperation } from '@nestjs/swagger';
import { AuthDto } from './dto/auth.dto';
import { UtilService } from 'src/common/services/util.service';

@Controller('api/auth')
export class AuthController {
  constructor(private readonly authSvc: AuthService, private readonly utilSvc: UtilService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verifica las credenciales y genera un JWT' })
  public async logIn(@Body() auth: AuthDto): Promise<any> {
    const { username, password } = auth;

    // Verificar usuario y contraseña en la base de datos
    const user = await this.authSvc.getUserByUsername(username);
    if (!user) {
      throw new UnauthorizedException('Usuario no encontrado');
    }

    if (await this.utilSvc.checkPassword(password, user.password!)) {
      // Obtener la informacion a enviar payload
      const { password, ...payload } = user;
      //  Generar token de aaceso por 60s
      const jwt = await this.utilSvc.generateJWT(payload);

      //FIXME: Generar token de actualización por 7 días
      const refreshToken = await this.utilSvc.generateJWT(payload, '7d');

      return { access_token: jwt, refresh_token: refreshToken };
    } else {
      throw new UnauthorizedException('Contraseña incorrecta');
    }
  }

  @Get('me')
  @ApiOperation({ summary: 'Extrae el id del usuario desde el token y busca la información del usuario' })
  public async getProfile(): Promise<string> {
    return 'Perfil del usuario';
  }


  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({summary: 'Genera un nuevo JWT utilizando un token de actualización válido'})
  public async refresh(): Promise<string> {
    return 'Token actualizado';
  }

  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({summary: 'Invalida el token de acceso actual y el token de actualización'})
  public async logOut(): Promise<string> {
    return 'Sesión cerrada';
  }

}