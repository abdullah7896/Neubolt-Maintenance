// src/app/guards/auth.guard.ts
import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(private router: Router) {}

  canActivate(): boolean | UrlTree {
    const token = localStorage.getItem('access_token'); // or whatever you store for auth
    if (token) {
      return true;
       // ✅ user is logged in
    } else {
      // ❌ not logged in — redirect to login
      return this.router.createUrlTree(['/login']);
    }
  }
}
