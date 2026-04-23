import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
  ForbiddenException
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { Request } from "express";
import { UtilService } from "../services/util.service";

@Injectable()
export class AuthGuard implements CanActivate {

  constructor(
    private readonly utilService: UtilService,
    private readonly reflector: Reflector
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {

    const request = context.switchToHttp().getRequest<Request>();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException('Token no proporcionado');
    }

    try {
      const payload = await this.utilService.verifyAccessJWT(token);

      request.user = payload;

      const requiredRoles = this.reflector.get<string[]>(
        'roles',
        context.getHandler()
      );

      if (requiredRoles && requiredRoles.length > 0) {
        const hasRole = requiredRoles.includes(payload.role);

        if (!hasRole) {
          throw new ForbiddenException('No tienes permisos');
        }
      }

      return true;

    } catch {
      throw new UnauthorizedException('Token inválido o expirado');
    }
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}