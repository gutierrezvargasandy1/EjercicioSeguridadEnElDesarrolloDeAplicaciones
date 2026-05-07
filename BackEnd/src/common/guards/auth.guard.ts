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

    console.log('[AuthGuard] Token extraído:', token ? 'existe' : 'NO existe');

    // ================= NO TOKEN =================
    if (!token) {
      console.warn('[AuthGuard] No se proporcionó token');
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
      console.log('[AuthGuard] Token verificado OK. Payload:', JSON.stringify(payload));
    } catch (error) {
      const err = error as any;
      console.error('[AuthGuard] Error al verificar token:', err?.message);
      throw new AppException(
        'Token inválido o expirado',
        HttpStatus.UNAUTHORIZED,
        ErrorCodes.INVALID_TOKEN,
      );
    }

    // ================= ASIGNAR USUARIO =================
    request.user = payload;
    console.log('[AuthGuard] req.user asignado:', JSON.stringify(request.user));

    // ================= ROLES =================
    const requiredRoles = this.reflector.get<string[]>(
      'roles',
      context.getHandler()
    );
    console.log('[AuthGuard] Roles requeridos:', requiredRoles);
    console.log('[AuthGuard] Rol del usuario:', payload?.role);

    if (requiredRoles && requiredRoles.length > 0) {
      const hasRole = requiredRoles.includes(payload.role);
      console.log('[AuthGuard] ¿Tiene el rol?', hasRole);

      if (!hasRole) {
        console.warn('[AuthGuard] Acceso denegado por rol insuficiente');
        throw new AppException(
          'No tienes permisos para acceder a este recurso',
          HttpStatus.FORBIDDEN,
          ErrorCodes.FORBIDDEN,
        );
      }
    } else {
      console.log('[AuthGuard] Ruta sin roles específicos, acceso permitido');
    }

    console.log('[AuthGuard] Acceso PERMITIDO ✅');
    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}