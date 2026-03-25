import { Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from 'bcrypt';
import { AuthService } from "src/auth/auth.service";

@Injectable()
export class UtilService {

    constructor(
        private readonly jwtSvc: JwtService,
        private readonly authSvc: AuthService
    ) {}

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

    public async generateJWT(payload: any, expiresIn: any = '7d'): Promise<string> {
        return await this.jwtSvc.signAsync(
            payload,
            { secret: process.env.JWT_SECRET, expiresIn }
        );
    }

    public async verifyJWT(token: string): Promise<any> {
        try {
            return await this.jwtSvc.verifyAsync(
                token,
                { secret: process.env.JWT_SECRET }
            );
        } catch {
            throw new UnauthorizedException('Token inválido o expirado');
        }
    }

    // ---------------- Métodos de Login, Refresh y Logout ----------------

    public async login(username: string, password: string): Promise<{ access_token: string, refresh_token: string }> {
        const user = await this.authSvc.getUserByUsername(username);
        if (!user) throw new UnauthorizedException('Usuario no encontrado');

        const valid = await this.checkPassword(password, user.password!);
        if (!valid) throw new UnauthorizedException('Contraseña incorrecta');

        const { password: _, ...payload } = user;

        const accessToken = await this.generateJWT(payload, '60s');
        const refreshToken = await this.generateJWT(payload, '7d');
        const hashRT = await this.hash(refreshToken);

        await this.authSvc.updateHash(payload.id, hashRT);

        return { access_token: accessToken, refresh_token: refreshToken };
    }

    public async refresh(refreshToken: string): Promise<{ access_token: string, refresh_token: string }> {
        if (!refreshToken) throw new UnauthorizedException('Refresh token no proporcionado');

        const payload = await this.verifyJWT(refreshToken);
        const user = await this.authSvc.getUserById(payload.id);

        if (!user?.hash) throw new UnauthorizedException('Usuario no válido');

        const isMatch = await this.checkHash(refreshToken, user.hash);
        if (!isMatch) throw new UnauthorizedException('Refresh token inválido');

        const { password: _, ...newPayload } = user;

        const newAccessToken = await this.generateJWT(newPayload, '60s');
        const newRefreshToken = await this.generateJWT(newPayload, '7d');
        const newHashRT = await this.hash(newRefreshToken);

        await this.authSvc.updateHash(user.id, newHashRT);

        return { access_token: newAccessToken, refresh_token: newRefreshToken };
    }

    public async logout(userId: number): Promise<void> {
        await this.authSvc.updateHash(userId, null);
    }
}