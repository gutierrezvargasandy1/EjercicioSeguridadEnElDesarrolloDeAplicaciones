import {
  CanActivate,
  ExecutionContext,
  Injectable,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { Request } from "express";
import { UtilService } from "../services/util.service";
import { AppException } from "../exceptions/AppException";
import { ErrorCodes } from "../exceptions/errorCodes";
import { HttpStatus } from "@nestjs/common";

@Injectable()
export class AuthGuard implements CanActivate {

  constructor(
    private readonly utilService: UtilService,
    private readonly reflector: Reflector
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {

    const request = context.switchToHttp().getRequest<Request>();
    const token = this.extractTokenFromHeader(request);


    // ================= NO TOKEN =================
    if (!token) {
      throw new AppException(
        'Token no proporcionado',
        HttpStatus.UNAUTHORIZED,
        ErrorCodes.UNAUTHORIZED,
      );
    }

    let payload: any;

    // ================= VERIFICAR TOKEN =================
    try {
      payload = await this.utilService.verifyAccessJWT(token);
    } catch (error) {
      const err = error as any;
      throw new AppException(
        'Token inválido o expirado',
        HttpStatus.UNAUTHORIZED,
        ErrorCodes.INVALID_TOKEN,
      );
    }

    // ================= ASIGNAR USUARIO =================
    request.user = payload;

    // ================= ROLES =================
    const requiredRoles = this.reflector.get<string[]>(
      'roles',
      context.getHandler()
    );

    if (requiredRoles && requiredRoles.length > 0) {
      const hasRole = requiredRoles.includes(payload.role);

      if (!hasRole) {
        throw new AppException(
          'No tienes permisos para acceder a este recurso',
          HttpStatus.FORBIDDEN,
          ErrorCodes.FORBIDDEN,
        );
      }
    } else {
    }

    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}