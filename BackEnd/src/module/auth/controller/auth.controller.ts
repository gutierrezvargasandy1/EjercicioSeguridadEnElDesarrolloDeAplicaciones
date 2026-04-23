import {
  Body, Controller, Delete, Get, HttpCode, HttpException, HttpStatus,
  Post, Put, Req, UnauthorizedException, UseGuards, Res
} from '@nestjs/common';
import { AuthDto } from '../dto/auth.dto';
import { UtilService } from 'src/common/services/util.service';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { AuthService } from '../service/auth.service';
import { CreateUserDto } from 'src/module/users/dto/create-user.dto';
import { UpdateUserDto } from 'src/module/users/dto/update-user.dto';
import { Roles } from 'src/common/decorators/role.decorator';
import { ChangePasswordDto } from '../dto/change-password-dto';
import { UpdateProfileDto } from '../dto/update-profile-dto';

@Controller('api/auth')
export class AuthController {

  constructor(
    private readonly utilSvc: UtilService,
    private readonly authService: AuthService
  ) { }

  // ================= LOGIN =================
  @Post('login')
  @HttpCode(HttpStatus.OK)
  public async login(@Body() auth: AuthDto, @Res({ passthrough: true }) res) {

    const { access_token, refresh_token } =
      await this.authService.login(auth.username, auth.password);

    res.cookie('refreshToken', refresh_token, {
      httpOnly: true,
      secure: false,
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    return { access_token };
  }

  // ================= ME =================
  @Get('me')
  @UseGuards(AuthGuard)
  @Roles('ADMIN', 'CLIENT')
  public async me(@Req() req: any) {
    return await this.authService.getUserById(req.user.id);
  }

  // ================= REFRESH =================
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  public async refresh(@Req() req, @Res({ passthrough: true }) res) {

    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      throw new UnauthorizedException('No refresh token');
    }

    const { access_token, refresh_token } =
      await this.authService.refresh(refreshToken);

    res.cookie('refreshToken', refresh_token, {
      httpOnly: true,
      secure: false,
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    return { access_token };
  }

  // ================= LOGOUT =================
  @Post('logout')
  @Roles('ADMIN', 'CLIENT')
  @HttpCode(HttpStatus.OK)
  public async logout(@Req() req: any, @Res({ passthrough: true }) res) {

    const refreshToken = req.cookies.refreshToken;

    if (refreshToken) {
      try {
        const payload = await this.utilSvc.verifyRefreshJWT(refreshToken);
        await this.authService.logout(payload.id);
      } catch { }
    }

    res.clearCookie('refreshToken');

    return { message: 'Sesión cerrada correctamente' };
  }

  // ================= REGISTER =================
  @Post('register')
  public async register(@Body() user: CreateUserDto) {
    return await this.authService.register(user);
  }

  // ================= DELETE =================
  @Delete('delete')
  @Roles('ADMIN', 'CLIENT')
  @UseGuards(AuthGuard)
  public async delete(@Req() req: any) {
    return await this.authService.deleteUser(req.user.id);
  }

  // ================= UPDATE PROFILE =================
  @Put('me')
  @Roles('ADMIN', 'CLIENT')
  @UseGuards(AuthGuard)
  public async update(
    @Req() req: any,
    @Body() data: UpdateProfileDto
  ) {
    return await this.authService.updateProfile(req.user.id, data);
  }


  // ================= CHANGE PASSWORD =================
  @Put('me/password')
  @Roles('ADMIN', 'CLIENT')
  @UseGuards(AuthGuard)
  public async changePassword(
    @Req() req: any,
    @Body() data: ChangePasswordDto
  ) {
    return await this.authService.changePassword(
      req.user.id,
      data.currentPassword,
      data.newPassword
    );
  }
}