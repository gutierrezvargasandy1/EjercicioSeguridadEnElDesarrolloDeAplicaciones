import { Controller, Get, Post, Put, Delete, Param, Body } from "@nestjs/common";
import { TareaService } from "./tarea.service";
import { CreateTareaDto } from "./dto/CreateTareaDto";  
import { UpdateTareaDto } from "./dto/update.tarea.dto";

@Controller('api/tareas')
export class TareaController {

    constructor(private readonly tareaService: TareaService) {}

    @Post()
     async crearTarea (@Body() data: CreateTareaDto) {
        return await this.tareaService.crearTarea(data);
    }

    @Get()
    async getTodas(): Promise<any> {
        return await this.tareaService.getTodasLasTareas();
    }

    @Get(':id')
    async getById(@Param('id') id: string): Promise<any> {
        return await this.tareaService.getTareaById(Number(id));
    }

    @Put(':id')
    async actualizar(
        @Param('id') id: string,
        @Body() data: UpdateTareaDto
    ) : Promise<any>{
        return await this.tareaService.actualizarTarea(Number(id), data);
    }

    @Delete(':id')
    async eliminar(@Param('id') id: string): Promise<any> {
        return await this.tareaService.eliminarTarea(Number(id));
    }
}
