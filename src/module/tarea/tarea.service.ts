import { Injectable } from "@nestjs/common";

@Injectable()
export class TareaService {

    public crearTarea(data: any) {
        return {
            mensaje: 'Tarea creada correctamente',
            data
        };
    }

    public getTodasLasTareas() {
        return {
            mensaje: 'Lista de tareas obtenida',
            tareas: []
        };
    }

    public getTareaById(id: number) {
        return {
            mensaje: `Se obtuvo la tarea ${id}`,
            tarea: { id }
        };
    }

    public actualizarTarea(id: number, data: any) {
        return {
            mensaje: `Tarea ${id} actualizada correctamente`,
            data
        };
    }

    public eliminarTarea(id: number) {
        return {
            mensaje: `Tarea ${id} eliminada correctamente`
        };
    }
}
