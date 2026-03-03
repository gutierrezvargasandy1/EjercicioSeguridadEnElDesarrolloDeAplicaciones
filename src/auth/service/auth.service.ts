import { Injectable } from '@nestjs/common';

@Injectable()
export class AuthService {
  public logIn(): string {
    return 'Sesión exitosa';
  }
}