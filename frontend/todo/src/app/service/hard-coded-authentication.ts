import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class HardCodedAuthentication {

  constructor() { }

  authenticate(username:string, password:string)
  {
    if(username=='samuel' && password=='dummy')
    {
      sessionStorage.setItem('authenticatedUser',username);
      return true
    }
    return false
  }
  isUserLoggedIn()
  {
    let user=sessionStorage.getItem('authenticatedUser')
    return !(user==null)
  }
  getLoggedInUsername()
  {
    return sessionStorage.getItem('authenticatedUser');
  }
  logout()
  {
    sessionStorage.removeItem('authenticatedUser');
  }
}
