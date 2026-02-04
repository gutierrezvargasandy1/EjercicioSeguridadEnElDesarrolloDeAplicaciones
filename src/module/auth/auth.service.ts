import { Injectable } from "@nestjs/common";

@Injectable({})
export class AuthService {

    public login(): string {
        return "Secion exitosa"
    }


}