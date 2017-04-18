import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { environment } from '../../../environments/environment';

@Injectable()
export class ContentService {

    constructor(private http: Http) { }

    getTestAboutContent() {
        return this.http.request('../../../assets/content/test-about-content.json')
            .map(res => res.json());
    }

    getProjects() {
        return this.http.get(`${environment.api}products`)
            .map(res => res.json());

    }
}
