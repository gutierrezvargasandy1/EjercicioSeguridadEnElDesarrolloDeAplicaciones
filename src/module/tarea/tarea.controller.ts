import { Controller, Get, Post, Put, Delete, Param, Body } from "@nestjs/common";
import { TareaService } from "./tarea.service";

@Controller('api/tareas')
export class TareaController {

    constructor(private readonly tareaService: TareaService) {}

    @Post()
    crearTarea(@Body() data: any) {
        return this.tareaService.crearTarea(data);
    }

    @Get()
    getTodas() {
        return this.tareaService.getTodasLasTareas();
    }

    @Get(':id')
    getById(@Param('id') id: string) {
        return this.tareaService.getTareaById(Number(id));
    }

    @Put(':id')
    actualizar(
        @Param('id') id: string,
        @Body() data: any
    ) {
        return this.tareaService.actualizarTarea(Number(id), data);
    }

    @Delete(':id')
    eliminar(@Param('id') id: string) {
        return this.tareaService.eliminarTarea(Number(id));
    }
}
