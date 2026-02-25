import { Inject, Injectable } from "@nestjs/common";
import { Client } from "pg";
import { CreateTareaDto } from "./dto/CreateTareaDto";
import { UpdateTareaDto } from "./dto/update.tarea.dto";
import {Tarea} from "./entities/tarea.entity";

@Injectable()
export class TareaService {

    constructor(
        @Inject('DATABASE_CONNECTION') private db: Client    
    ){}

    public  async crearTarea(task: CreateTareaDto) { 
        const query = 'INSERT INTO tarea (name, description, priority, user_id) VALUES ($1, $2, $3, $4) RETURNING *;';
        const values = [task.name, task.description, task.priority, task.user_id];
        const Tarea = await this.db.query(query, values);

        return {
            mensaje: 'Tarea creada correctamente',
            data: Tarea.rows,
            Estado : true
        };
    }

    public  async getTodasLasTareas() {
        const query = 'SELECT * FROM tarea;';
        const Tarea =  await this.db.query(query);

        return {
            mensaje: 'Lista de tareas obtenida',
            tareas:  Tarea.rows
        };
    }

    public async getTareaById(id: number) {
        const query = 'SELECT * FROM tarea WHERE id = $1;';
        const Tarea = await this.db.query(query, [id]);
        return {
            mensaje: `Se obtuvo la tarea ${id}`,
            tarea: Tarea.rows
        };
    }

    public async actualizarTarea(id: number, data: UpdateTareaDto) {
        const query = 'UPDATE tarea SET name = $1, description = $2, priority = $3, user_id = $4 WHERE id = $5 RETURNING *;';
        const values = [data.name, data.Description, data.priority, data.name, id];
        const result = await this.db.query(query, [id]);
        return {
            mensaje: `Tarea ${id} actualizada correctamente`,
             data: result.rows
        };
    }

    public async eliminarTarea(id: number) {
        const query = 'DELETE FROM tarea WHERE id = $1;';
        const result =  await this.db.query(query , [id]);

        return {
            mensaje: `Tarea ${id} eliminada correctamente`,
            data : true
        };
    }
}
