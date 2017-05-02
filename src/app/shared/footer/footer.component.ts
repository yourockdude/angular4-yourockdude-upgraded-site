import { Component, OnInit } from '@angular/core';
import { ContentService } from '../services/content.service';

@Component({
    moduleId: module.id,
    selector: 'app-yourock-footer',
    templateUrl: 'footer.component.html'
})

export class FooterComponent implements OnInit {
    footerContacts: any;

    constructor(
        private contentService: ContentService,
    ) {
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

    ngOnInit() { }
}
