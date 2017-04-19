import { Injectable } from '@angular/core';
import {
    Http,
    Response,
} from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { environment } from '../../../environments/environment';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';

@Injectable()
export class EmailService {
    constructor(private http: Http) { }

    sendEmail(formData: FormData) {
        return this.http.post(`${environment.api}send_email`, formData)
            .map(res => {
                return res.json();
            });
    }
}
