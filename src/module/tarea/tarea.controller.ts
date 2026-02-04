import { Controller, Get } from "@nestjs/common";
import { TareaService } from "./tarea.service";

@Controller('api/tareas')
export class TareaController{
    constructor(private readonly tareaService : TareaService ){}
    
    @Get()
    public mostrarTareaController() : String {
           return this.tareaService.mostrarTareas();

    }
}