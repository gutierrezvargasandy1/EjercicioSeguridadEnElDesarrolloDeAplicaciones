import { Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from 'bcrypt';
import { AuthService } from "src/module/auth/service/auth.service";

@Injectable()
export class UtilService {

    constructor(
        private readonly jwtSvc: JwtService,
    ) { }

    // ---------------- Funciones de hash y comparación ----------------
    public async hash(text: string): Promise<string> {
        const saltRounds = 10;
        return await bcrypt.hash(text, saltRounds);
    }

    public async checkPassword(password: string, encryptedPassword: string): Promise<boolean> {
        return await bcrypt.compare(password, encryptedPassword);
    }

    public async checkHash(text: string, hash: string): Promise<boolean> {
        return await bcrypt.compare(text, hash);
    }

    // ================= JWT HELPERS =================

    public async generateAccessJWT(
        payload: { id: number; username: string; role: string },
        expiresIn: any = '1m'
    ): Promise<string> {
        return await this.jwtSvc.signAsync(
            payload,
            { secret: process.env.JWT_ACCESS_SECRET, expiresIn }
        );
    }

    public async generateRefreshJWT(
        payload: { id: number; username: string },
        expiresIn: any = '7d'
    ): Promise<string> {
        return await this.jwtSvc.signAsync(
            payload,
            { secret: process.env.JWT_REFRESH_SECRET, expiresIn }
        );
    }

    public async verifyAccessJWT(token: string): Promise<any> {
        try {
            return await this.jwtSvc.verifyAsync(
                token,
                { secret: process.env.JWT_ACCESS_SECRET }
            );
        } catch {
            throw new UnauthorizedException('Access token inválido o expirado');
        }
    }

    public async verifyRefreshJWT(token: string): Promise<any> {
        try {
            return await this.jwtSvc.verifyAsync(
                token,
                { secret: process.env.JWT_REFRESH_SECRET }
            );
        } catch {
            throw new UnauthorizedException('Refresh token inválido o expirado');
        }
    }

  
}
