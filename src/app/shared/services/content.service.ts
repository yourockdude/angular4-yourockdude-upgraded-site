import { Injectable } from '@angular/core';
import { Http, RequestOptions, Headers } from '@angular/http';
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

    getProjectById(id: string) {
        return this.http.get(`${environment.api}product/${id}`)
            .map(res => res.json());
    }

    getHomePage() {
        return this.http.get(`${environment.api}pages/main${this.currentLanguage.toUpperCase()}`)
            .map(res => res.json());
    }

    getNavbar() {
        return this.http.get(`${environment.api}pages/navbar${this.currentLanguage.toUpperCase()}`)
            .map(res => res.json());
    }

    getHireUsForm() {
        return this.http.get(`${environment.api}pages/hireUs${this.currentLanguage.toUpperCase()}`)
            .map(res => res.json());
    }

    getAboutPage() {
        return this.http.get(`${environment.api}pages/about${this.currentLanguage.toUpperCase()}`)
            .map(res => res.json());
    }

    editHomeTitle(title: string) {
        const body = JSON.stringify({ title: title });
        const headers = new Headers({ 'Content-Type': 'application/json' });
        const options = new RequestOptions({ headers: headers });
        return this.http.put(`${environment.api}pages/main${this.currentLanguage.toUpperCase()}`, body, options)
            .map(res => res.json());
    }

    editAboutPage(aboutPage: any) {
        const body = JSON.stringify(aboutPage);
        const headers = new Headers({ 'Content-Type': 'application/json' });
        const options = new RequestOptions({ headers: headers });
        return this.http.put(`${environment.api}pages/about${this.currentLanguage.toUpperCase()}`, body, options)
            .map(res => res.json());
    }

    editProject(id: string, project: any) {
        const body = JSON.stringify(project);
        const headers = new Headers({ 'Content-Type': 'application/json' });
        const options = new RequestOptions({ headers: headers });
        return this.http.put(`${environment.api}product/${id}`, body, options)
            .map(res => res.json());
    }

}
