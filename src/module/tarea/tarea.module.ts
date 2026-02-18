import { Module } from "@nestjs/common";
import { TareaController } from "./tarea.controller";
import { TareaService } from "./tarea.service";
import { databaseProviders } from "src/common/providers/database.provider";

@Module({controllers:[TareaController],
          providers:[TareaService, databaseProviders[0]]
})
export class TareaModule {}