import { Injectable } from '@angular/core';
import { Http, RequestOptions, Headers } from '@angular/http';
import { environment } from '../../../environments/environment';
import { AuthHttp } from 'angular2-jwt';

@Injectable()
export class ContentService {
    currentLanguage: string;

    constructor(
        private http: Http,
        private authHttp: AuthHttp,
    ) {
        this.currentLanguage = localStorage.getItem('current_language');
    }

    getProjects(lang?: string) {
        const headers = new Headers({ 'Access-Control-Allow-Origin': '*' });
        const options = new RequestOptions({ headers: headers });
        return this.http.get(`${environment.api}products/${lang ? lang : this.currentLanguage}`, options)
            .map(res => res.json());
    }

    getProjectById(id: string) {
        const headers = new Headers({ 'Access-Control-Allow-Origin': '*' });
        const options = new RequestOptions({ headers: headers });
        return this.http.get(`${environment.api}product/${id}`, options)
            .map(res => res.json());
    }

    getHomePage() {
        const headers = new Headers({ 'Access-Control-Allow-Origin': '*' });
        const options = new RequestOptions({ headers: headers });
        return this.http.get(`${environment.api}pages/main${this.currentLanguage.toUpperCase()}`, options)
            .map(res => res.json());
    }

    getNavbar() {
        const headers = new Headers({ 'Access-Control-Allow-Origin': '*' });
        const options = new RequestOptions({ headers: headers });
        return this.http.get(`${environment.api}pages/navbar${this.currentLanguage.toUpperCase()}`, options)
            .map(res => res.json());
    }

    getHireUsForm() {
        const headers = new Headers({ 'Access-Control-Allow-Origin': '*' });
        const options = new RequestOptions({ headers: headers });
        return this.http.get(`${environment.api}pages/hireUs${this.currentLanguage.toUpperCase()}`, options)
            .map(res => res.json());
    }

    getAboutPage() {
        const headers = new Headers({ 'Access-Control-Allow-Origin': '*' });
        const options = new RequestOptions({ headers: headers });
        return this.http.get(`${environment.api}pages/about${this.currentLanguage.toUpperCase()}`, options)
            .map(res => res.json());
    }

    getContacts() {
        const headers = new Headers({ 'Access-Control-Allow-Origin': '*' });
        const options = new RequestOptions({ headers: headers });
        return this.http.get(`${environment.api}pages/socialLinks${this.currentLanguage.toUpperCase()}`, options)
            .map(res => res.json());
    }

    editHomeTitle(title: string) {
        const body = JSON.stringify({ title: title });
        const headers = new Headers({ 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
        const options = new RequestOptions({ headers: headers });
        return this.authHttp.put(`${environment.api}pages/main${this.currentLanguage.toUpperCase()}`, body, options)
            .map(res => res.json());
    }

    editContacts(contacts: any) {
        const body = JSON.stringify({ socialLinks: contacts });
        const headers = new Headers({ 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
        const options = new RequestOptions({ headers: headers });
        return this.authHttp.put(`${environment.api}pages/socialLinks${this.currentLanguage.toUpperCase()}`, body, options)
            .map(res => res.json());
    }

    editAboutPage(aboutPage: any) {
        const body = JSON.stringify(aboutPage);
        const headers = new Headers({ 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
        const options = new RequestOptions({ headers: headers });
        return this.authHttp.put(`${environment.api}pages/about${this.currentLanguage.toUpperCase()}`, body, options)
            .map(res => res.json());
    }

    editProject(id: string, project: any) {
        const body = JSON.stringify(project);
        const headers = new Headers({ 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
        const options = new RequestOptions({ headers: headers });
        return this.authHttp.put(`${environment.api}product/${id}`, body, options)
            .map(res => res.json());
    }

    addProject(project: any) {
        const body = JSON.stringify(project);
        const headers = new Headers({ 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
        const options = new RequestOptions({ headers: headers });
        return this.authHttp.post(`${environment.api}products/${this.currentLanguage}`, body, options)
            .map(res => res.json());
    }

    deleteProject(id: string) {
        const headers = new Headers({ 'Access-Control-Allow-Origin': '*' });
        const options = new RequestOptions({ headers: headers });
        return this.authHttp.delete(`${environment.api}product/${id}`, options)
            .map(res => res.json());
    }

    uploadMedia(formData: FormData) {
        return this.authHttp.post(`${environment.api}product_file`, formData)
            .map(res => res.json());
    }
}
