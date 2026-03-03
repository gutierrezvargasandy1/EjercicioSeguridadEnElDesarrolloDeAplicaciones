import { Controller, Get } from '@nestjs/common';
import { AuthService } from '../service/auth.service';

@Controller('api/auth')
export class AuthController {
  constructor(private readonly authSvc: AuthService) {}

  @Get('1')
  public logIn(): string {
    return this.authSvc.logIn();
  }
}