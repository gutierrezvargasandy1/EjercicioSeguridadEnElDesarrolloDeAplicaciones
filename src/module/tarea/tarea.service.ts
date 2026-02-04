import { Injectable } from "@nestjs/common";

@Injectable({})
export class TareaService {

    public mostrarTareas () : string {
        return "Estas son las tareas de hoy"
    }

}