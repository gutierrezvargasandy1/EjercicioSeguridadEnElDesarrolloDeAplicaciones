import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Login } from './login/login';
import { FormsModule } from '@angular/forms';
import { Profile } from './profile/profile';
import { RouterModule } from '@angular/router';



@NgModule({
  declarations: [
    Login,
    Profile
  ],
  imports: [
    CommonModule,
    FormsModule,
    RouterModule
]
})
export class AuthModule { }
