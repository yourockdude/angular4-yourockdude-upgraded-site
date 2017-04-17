import { Injectable } from '@angular/core';
import { Http } from '@angular/http';

@Injectable()
export class DescriptionService {

    constructor(private http: Http) { }

    getTestAboutContent() {
        return this.http.request('../../../assets/content/test-about-content.json')
            .map(res => res.json());
    }

    getTestHomeContent() {
        return this.http.request('../../../assets/content/test-home-content.json')
            .map(res => res.json());
    }
}
