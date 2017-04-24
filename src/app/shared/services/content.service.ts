import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { environment } from '../../../environments/environment';

@Injectable()
export class ContentService {
    currentLanguage: string;

    constructor(private http: Http) {
        this.currentLanguage = localStorage.getItem('current_language');
    }

    getProjects() {
        return this.http.get(`${environment.api}products/${this.currentLanguage}`)
            .map(res => res.json());
    }

    // getHomeTitle() {
    //     return this.http.request('../../../assets/content/home-title.json')
    //         .map(res => res.json());
    // }

    getHomePage() {
        return this.http.get(`${environment.api}pages/main${this.currentLanguage.toUpperCase()}`)
            .map(res => res.json());
    }

    // getNavbar() {
    //     return this.http.request(`../../../assets/content/navbar-${this.currentLanguage}.json`)
    //         .map(res => res.json());
    // }

    getNavbar() {
        return this.http.get(`${environment.api}pages/navbar${this.currentLanguage.toUpperCase()}`)
            .map(res => res.json());
    }

    // getStaticHome() {
    //     return this.http.request(`../../../assets/content/home-static-${this.currentLanguage}.json`)
    //         .map(res => res.json());
    // }

    // getStaticHome() {
    //     return this.http.get(`${environment.api}pages/${name}${this.currentLanguage.toUpperCase()}`)
    //         .map(res => res.json());
    // }

    // getHireUsForm() {
    //     return this.http.request(`../../../assets/content/hire-us-form-${this.currentLanguage}.json`)
    //         .map(res => res.json());
    // }

    getHireUsForm() {
        return this.http.get(`${environment.api}pages/hireUs${this.currentLanguage.toUpperCase()}`)
            .map(res => res.json());
    }

    // getStaticAbout() {
    //     return this.http.request(`../../../assets/content/about-static-${this.currentLanguage}.json`)
    //         .map(res => res.json());
    // }

    getAboutPage() {
        return this.http.get(`${environment.api}pages/about${this.currentLanguage.toUpperCase()}`)
            .map(res => res.json());
    }

}
