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
        return this.http.get(`${environment.api}products/ru`)
            .map(res => res.json());
    }

    // getHomeTitle() {
    //     return this.http.request('../../../assets/content/home-title.json')
    //         .map(res => res.json());
    // }

    getHomeTitle(name: string) {
        return this.http.get(`${environment.api}pages/${name}RU`)
            .map(res => res.json());
    }
}
