import { Component, OnInit } from '@angular/core';
import { ContentService } from '../../shared/services/content.service';
import { AboutPage } from '../../shared/models/about-page';
import { clone } from '../../shared/utils/clone-object';
import { toggleLoader } from '../../shared/utils/loader';

@Component({
    moduleId: module.id,
    selector: 'app-yourock-agency',
    templateUrl: 'agency.component.html'
})

export class AgencyComponent implements OnInit {
    aboutPage: AboutPage;
    editAboutPage: AboutPage;
    editing = false;

    constructor(
        private contentService: ContentService
    ) {
        toggleLoader(true, 'edit_page', 'holder');
        this.contentService.getAboutPage().subscribe(res => {
            this.aboutPage = res.data;
            toggleLoader(false, 'edit_page', 'holder');
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
