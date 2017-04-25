import { Component, OnInit } from '@angular/core';

import { AuthorizationService } from '../shared/services/authorization.service';
import { ContentService } from '../shared/services/content.service';

import { swithLanguage } from '../shared/utils/swith-language';

@Component({
    moduleId: module.id,
    selector: 'app-yourock-admin',
    templateUrl: 'admin.component.html',
})

export class AdminComponent implements OnInit {
    projects: any[];
    constructor(
        private authorizationService: AuthorizationService,
        private contentService: ContentService,
    ) {
        this.contentService.getProjects().subscribe(res => {
            this.projects = res.data;
        });
    }

    ngOnInit() { }

    signOut() {
        // add a confirmation
        this.authorizationService.signOut();
    }

    swithLanguage(btn: string) {
        swithLanguage(btn);
    }
}
