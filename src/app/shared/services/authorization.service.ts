import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import { Router } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';

import { User } from '../models/user';
import { environment } from '../../../environments/environment';

@Injectable()
export class AuthorizationService {
    authorizationPath = '/authorization';

    constructor(
        private http: Http,
        private router: Router,
    ) { }

    signIn(user: User) {
        return this.http.post(`${environment.api}auth`, user)
            .map(res => {
                const response = res.json();
                if (response.success) {
                    localStorage.setItem('token', response.data);
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
}
