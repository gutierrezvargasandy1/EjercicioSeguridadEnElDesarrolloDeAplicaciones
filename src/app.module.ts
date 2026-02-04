import { Module } from '@nestjs/common';
import { AuthModule } from './module/auth/auth.module';
import { TareaModule } from './module/tarea/tarea.module';


@Module({
  imports: [AuthModule,TareaModule]
})
export class AppModule {}
