import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { environment } from '../../../environments/environment';

@Injectable()
export class ContentService {
    currentLanguage: string;

    constructor(private http: Http) {
        this.currentLanguage = localStorage.getItem('current_language');
    }

    getTestAboutContent() {
        return this.http.request('../../../assets/content/test-about-content.json')
            .map(res => res.json());
    }

    getProjects() {
        return this.http.get(`${environment.api}products/${this.currentLanguage}`)
            .map(res => res.json());
    }

    // getHomeTitle() {
    //     return this.http.request('../../../assets/content/home-title.json')
    //         .map(res => res.json());
    // }

    getHomeTitle(name: string) {
        return this.http.get(`${environment.api}pages/${name}${this.currentLanguage.toUpperCase()}`)
            .map(res => res.json());
    }

    getNavbar() {
        return this.http.request(`../../../assets/content/navbar-${this.currentLanguage}.json`)
            .map(res => res.json());
    }

    getStaticHome() {
        return this.http.request(`../../../assets/content/home-static-${this.currentLanguage}.json`)
            .map(res => res.json());
    }

    getHireUsForm() {
        return this.http.request(`../../../assets/content/hire-us-form-${this.currentLanguage}.json`)
            .map(res => res.json());
    }

    getStaticAbout() {
        return this.http.request(`../../../assets/content/about-static-${this.currentLanguage}.json`)
            .map(res => res.json());
    }

}
