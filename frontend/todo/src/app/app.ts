import { Component } from '@angular/core';
import { Welcome } from "./welcome/welcome";
import { Login } from "./login/login";
import { RouterOutlet } from '@angular/router';
import { Menu } from './menu/menu';
import { Footer } from './footer/footer';
import { HttpClient, HttpClientModule } from '@angular/common/http';


@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Menu, Footer,HttpClientModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected title = 'todo';
  msg='Sam'
}
