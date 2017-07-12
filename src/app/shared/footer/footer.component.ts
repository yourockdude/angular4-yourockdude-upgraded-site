import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { ContentService } from '../services/content.service';

@Component({
    moduleId: module.id,
    selector: 'app-yourock-footer',
    templateUrl: 'footer.component.html',
})

export class FooterComponent implements OnInit {
    footerContacts: any;
    currentLanguage: string;
    isAgency: boolean;

    constructor(
        private contentService: ContentService,
        private router: Router,
    ) {
        this.currentLanguage = localStorage.getItem('current_language');
        this.isAgency = location.pathname === '/about' ? true : false;
        this.router.events.subscribe((val) => {
            if (val instanceof NavigationEnd) {
                this.isAgency = val.url === '/about' ? true : false;
            }
        });
        this.contentService.getContacts().subscribe(res => {
            if (res.success) {
                this.footerContacts = {
                    facebook: res.data.socialLinks.find(f => f.name === 'Facebook').link,
                    behance: res.data.socialLinks.find(f => f.name === 'Behance').link,
                    instagram: res.data.socialLinks.find(f => f.name === 'Instagram').link,
                };
            }
        });
    }

    ngOnInit() {
    }
}
