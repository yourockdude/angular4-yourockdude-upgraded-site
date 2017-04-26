import { Component, OnInit } from '@angular/core';
import { ContentService } from '../../shared/services/content.service';
import { AboutPage } from '../../shared/models/about-page';
import { clone } from '../../shared/utils/clone-object';

@Component({
    moduleId: module.id,
    selector: 'app-yourock-agency',
    templateUrl: 'agency.component.html'
})

export class AgencyComponent implements OnInit {
    aboutPage: AboutPage;
    editAboutPage: AboutPage;
    editing = false;

    constructor(private contentService: ContentService) {
        this.contentService.getAboutPage().subscribe(res => {
            this.aboutPage = res.data;
            console.log(this.aboutPage.capabilities);
        });
    }

    ngOnInit() { }

    edit() {
        this.editing = true;
        this.editAboutPage = clone(this.aboutPage);
    }

    save() {
        this.aboutPage = this.editAboutPage;
        this.contentService.editAboutPage(this.editAboutPage)
            .subscribe(res => {
                if (res.success) {
                    this.editing = false;
                    this.aboutPage = clone(this.editAboutPage);
                };
            });
    }

    cancel() {
        this.editing = false;
        this.editAboutPage = clone(this.aboutPage);
    };

}
