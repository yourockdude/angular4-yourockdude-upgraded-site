import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';

import { User } from '../models/user';
import { environment } from '../../../environments/environment';

@Injectable()
export class AuthorizationService {
    constructor(private http: Http) { }

    signIn(user: User) {
        return this.http.post(`${environment.api}auth`, user)
            .map(res => res.json());
    }
}
