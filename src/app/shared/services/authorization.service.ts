import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import { Router } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';

import { User } from '../models/user';
import { environment } from '../../../environments/environment';

import { AuthHttp, JwtHelper } from 'angular2-jwt';

@Injectable()
export class AuthorizationService {
    authorizationPath = '/authorization';
    jwtHelper: JwtHelper = new JwtHelper();

    constructor(
        private http: Http,
        private router: Router,
        private authHttp: AuthHttp,
    ) { }

    signIn(user: User) {
        return this.http.post(`${environment.api}auth`, user)
            .map(res => {
                const response = res.json();
                if (response.success) {
                    localStorage.setItem('token', response.data);
                    this.scheduleRefresh()
                }
                return response;
            });
    }

    signOut() {
        localStorage.removeItem('token');
        this.router.navigate([this.authorizationPath]);
    }

    getUser() {
        return localStorage.getItem('token');
    }

    scheduleRefresh() {
        this.authHttp.tokenStream.subscribe(
            token => {
                const now: number = new Date().valueOf();
                const jwtExp = this.jwtHelper.decodeToken(token).exp;
                const exp = new Date(0);
                exp.setUTCSeconds(jwtExp);
                const delay = exp.valueOf() - now;

                setTimeout(() => {
                    this.getRefreshToken();
                }, delay);
            },
            err => console.log(err)
        );
    }

    getRefreshToken() {
        this.signOut();
    }
}
