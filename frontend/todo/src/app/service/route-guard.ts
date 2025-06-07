import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, GuardResult, MaybeAsync, Router, RouterStateSnapshot } from '@angular/router';
import { HardCodedAuthentication } from './hard-coded-authentication';

@Injectable({
  providedIn: 'root'
})
export class RouteGuard implements CanActivate{

  constructor(private hardCodedAuthentication:HardCodedAuthentication,private router:Router) { }
  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    if(this.hardCodedAuthentication.isUserLoggedIn())
      return true;
  
    this.router.navigate(['login'])
    return false;
  }
}
