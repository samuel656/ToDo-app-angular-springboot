import { Component, OnInit } from '@angular/core';
import { HardCodedAuthentication } from '../service/hard-coded-authentication';

@Component({
  selector: 'app-logout',
  imports: [],
  templateUrl: './logout.html',
  styleUrl: './logout.css'
})
export class Logout implements OnInit{
  constructor(private hardCodedAuthentication:HardCodedAuthentication)
  {

  }
  ngOnInit() {
    this.hardCodedAuthentication.logout();
  }
  

}
