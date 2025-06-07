import { Routes } from '@angular/router';
import { Login } from './login/login';
import { Welcome } from './welcome/welcome';
import { Error } from './error/error';
import { ListTodos } from './list-todos/list-todos';
import { Todo } from './todo/todo';
import { Logout } from './logout/logout';
import { RouteGuard } from './service/route-guard';



export const routes: Routes = [
    {path:'',component:Login},
    {path:'login',component:Login},
    {path:'welcome/:username',component:Welcome,canActivate:[RouteGuard]},
    {path:'todos/:username',component:ListTodos,canActivate:[RouteGuard] },
    {path:'todos/:username/:id',component:Todo,canActivate:[RouteGuard] },
    {path:'logout',component:Logout,canActivate:[RouteGuard]},
    {path:'**',component:Error}
    
];


