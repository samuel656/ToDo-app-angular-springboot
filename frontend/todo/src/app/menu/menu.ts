import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { HardCodedAuthentication } from '../service/hard-coded-authentication';
import { NgIf } from '@angular/common';


@Component({
  selector: 'app-menu',
  imports: [RouterLink,NgIf],
  standalone:true,
  templateUrl: './menu.html',
  styleUrl: './menu.css'
})
export class Menu implements OnInit {
  isUserLoggedIn:boolean=false
  getUserName:string="";
 
  constructor(public hardCodedAuthentication:HardCodedAuthentication) { }
 
  ngOnInit() {
    this.getUserName = this.hardCodedAuthentication.getLoggedInUsername() || '';
    this.isUserLoggedIn=this.hardCodedAuthentication.isUserLoggedIn()
  }
 
}