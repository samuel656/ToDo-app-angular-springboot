import { HttpClient } from '@angular/common/http';
import { HttpClientModule } from '@angular/common/http';

import { Injectable } from '@angular/core';

export class HelloWorldBean{
  constructor(
    public message:string
  )
  {}
}

@Injectable({
  providedIn: 'root'
})
export class WelcomeData {

  constructor(
    private http:HttpClient
  ) { }

 getHelloMessage() {
  return this.http.get<HelloWorldBean>('http://localhost:8082/hello-world-bean');
}
 getHelloMessageWithPath(name:String) {
  return this.http.get<HelloWorldBean>(`http://localhost:8082/hello-world-bean/path/${name}`);
}

}
