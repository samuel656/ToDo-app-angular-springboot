import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgIf } from '@angular/common';
import { Welcome } from '../welcome/welcome';
import { Router } from '@angular/router';
import { HardCodedAuthentication } from '../service/hard-coded-authentication';

@Component({
  selector: 'app-login',
  imports: [FormsModule,NgIf],
  templateUrl: './login.html',
  styleUrl: './login.css'
})

export class Login implements OnInit {
  username='samuel'
  password=''
  errorMsg="Invalid credentials"
  inValidLogin=false

  constructor(private router:Router,private hardCodedAuthentication:HardCodedAuthentication)
  {

  }
  ngOnInit(){
    
  }
  handleLogin()
  {
    if(this.hardCodedAuthentication.authenticate(this.username,this.password))
    {
      this.inValidLogin=false
      this.router.navigate(['welcome',this.username])
      console.log("Login Sucessfull")
    }
    else{
      this.inValidLogin=true
    }
  }

}
