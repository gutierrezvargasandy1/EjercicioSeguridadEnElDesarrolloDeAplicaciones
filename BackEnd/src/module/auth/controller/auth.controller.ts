import {
  Body, Controller, Delete, Get, HttpCode, HttpStatus,
  Post, Put, Req, UnauthorizedException, UseGuards, Res
} from '@nestjs/common';
import { AuthDto } from '../dto/auth.dto';
import { UtilService } from 'src/common/services/util.service';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { AuthService } from '../service/auth.service';
import { CreateUserDto } from 'src/module/users/dto/create-user.dto';
import { Roles } from 'src/common/decorators/role.decorator';
import { ChangePasswordDto } from '../dto/change-password-dto';
import { UpdateProfileDto } from '../dto/update-profile-dto';

@Controller('api/auth')
export class AuthController {

  constructor(
    private readonly utilSvc: UtilService,
    private readonly authService: AuthService,
  ) {}

  // ================= LOGIN =================
  @Post('login')
  @HttpCode(HttpStatus.OK)
  public async login(
    @Body() auth: AuthDto,
    @Res({ passthrough: true }) res,
  ) {
    const { access_token, refresh_token } =
      await this.authService.login(auth.username, auth.password);

    res.cookie('refreshToken', refresh_token, {
      httpOnly: true,
      secure:   false,
      sameSite: 'strict',
      maxAge:   7 * 24 * 60 * 60 * 1000,
    });

    return { access_token };
  }

  // ================= ME =================
  @Get('me')
  @UseGuards(AuthGuard)
  @Roles('ADMIN', 'CLIENT')
  public async me(@Req() req: any) {
    return this.authService.getUserById(req.user.id);
  }

  // ================= REFRESH =================
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  public async refresh(
    @Req() req,
    @Res({ passthrough: true }) res,
  ) {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      throw new UnauthorizedException('No refresh token');
    }

    const { access_token, refresh_token } =
      await this.authService.refresh(refreshToken);

    res.cookie('refreshToken', refresh_token, {
      httpOnly: true,
      secure:   false,
      sameSite: 'strict',
      maxAge:   7 * 24 * 60 * 60 * 1000,
    });

    return { access_token };
  }

  // ================= LOGOUT =================
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  public async logout(
    @Req() req: any,
    @Res({ passthrough: true }) res,
  ) {
    const refreshToken = req.cookies.refreshToken;

    if (refreshToken) {
      try {
        const payload = await this.utilSvc.verifyRefreshJWT(refreshToken);
        await this.authService.logout(payload.id);
      } catch {}
    }

    res.clearCookie('refreshToken');
    return { message: 'Sesión cerrada correctamente' };
  }

  // ================= REGISTER =================
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  public async register(@Body() user: CreateUserDto) {
    return this.authService.register(user);
  }

  // ================= DELETE =================
  @Delete('delete')
  @UseGuards(AuthGuard)
  @Roles('ADMIN', 'CLIENT')
  @HttpCode(HttpStatus.OK)
  public async delete(
    @Req() req: any,
    @Res({ passthrough: true }) res,
  ) {
    // ✅ Borrar usuario (audit log va primero dentro del service)
    await this.authService.deleteUser(req.user.id);

    // ✅ Limpiar cookie — el usuario ya no existe, invalidar sesión
    res.clearCookie('refreshToken');

    return { message: 'Cuenta eliminada correctamente' };
  }

  // ================= UPDATE PROFILE =================
  @Put('me')
  @UseGuards(AuthGuard)
  @Roles('ADMIN', 'CLIENT')
  public async update(
    @Req() req: any,
    @Body() data: UpdateProfileDto,
  ) {
    return this.authService.updateProfile(req.user.id, data);
  }

  // ================= CHANGE PASSWORD =================
  @Put('me/password')
  @UseGuards(AuthGuard)
  @Roles('ADMIN', 'CLIENT')
  public async changePassword(
    @Req() req: any,
    @Body() data: ChangePasswordDto,
  ) {
    return this.authService.changePassword(
      req.user.id,
      data.currentPassword,
      data.newPassword,
    );
  }
}