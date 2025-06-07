import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HelloWorldBean, WelcomeData } from '../service/data/welcome-data';
import { HttpClient } from '@angular/common/http';
import { HardCodedAuthentication } from '../service/hard-coded-authentication';
@Component({
  selector: 'app-welcome',
  standalone: true,
  imports: [RouterLink, CommonModule], 
  templateUrl: './welcome.html',
  styleUrls: ['./welcome.css']
})
export class Welcome implements OnInit {
  username = '';
  messageFromServer = '';

  constructor(
    private route: ActivatedRoute,
    private welcomeData: WelcomeData,
    public hardCodedAuthentication:HardCodedAuthentication
  ) {}

  ngOnInit() {
    this.username = this.route.snapshot.params['username'];
    console.log('Username:', this.username);
  }

  getHelloMessage() {
    this.welcomeData.getHelloMessage().subscribe(
      response=>this.handleResponseMessage(response),
      error=>this.handleErrorMsg(error)
    );
  }
  getHelloMessagePath() {
    this.welcomeData.getHelloMessageWithPath(this.username).subscribe(
      response=>this.handleResponseMessage(response),
      error=>this.handleErrorMsg(error)
    );
  }

  handleResponseMessage(response:HelloWorldBean)
  {
    this.messageFromServer=response.message;
  }
  handleErrorMsg(error: { message: string; })
  {
    this.messageFromServer=error.message
  }
}
