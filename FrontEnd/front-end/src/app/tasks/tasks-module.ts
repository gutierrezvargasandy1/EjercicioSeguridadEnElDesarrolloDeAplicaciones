import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { List } from './list/list';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AgregarTarea } from './agregar-tarea/agregar-tarea';
import { TareaDetails } from './tarea-details/tarea-details';



@NgModule({
  declarations: [
    List,
    AgregarTarea,
    TareaDetails
  ],
  imports: [
    CommonModule,
    FormsModule,
    RouterModule
  ]
})
export class TasksModule { }
