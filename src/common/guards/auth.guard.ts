import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { Observable } from "rxjs";
import { Request } from "express";
import { UtilService } from "../services/util.service";

@Injectable()
export class AuthGuard implements CanActivate {
    constructor (private readonly  utilService: UtilService) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest() as Request;
        const token = this.extractTokenFromHeader(request);
        console.log(token, "Este es el toquen JWT")

        if (!token)
            throw new UnauthorizedException();

        try {
            const payload = await this.utilService.getPayload(token);
            request ['user'] = payload;
        }

        catch(error){
            console.log  (error)
            throw new UnauthorizedException();
        }

        return true


    }

    private extractTokenFromHeader(request: Request): string | undefined {
        const [type, token] = request.headers.authorization?.split(' ') ?? [];
        return type === 'Bearer' ? token : undefined;
    }
}