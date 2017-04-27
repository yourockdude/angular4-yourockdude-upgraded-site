import { Component, OnInit, OnDestroy } from '@angular/core';

import { AuthorizationService } from '../shared/services/authorization.service';
import { ContentService } from '../shared/services/content.service';
import { ProjectService } from '../shared/services/project.service';

import { swithLanguage } from '../shared/utils/swith-language';
import { Subscription } from 'rxjs/Rx';

@Component({
    moduleId: module.id,
    selector: 'app-yourock-admin',
    templateUrl: 'admin.component.html',
})

export class AdminComponent implements OnInit, OnDestroy {
    projects: any[] = [];
    subscription: Subscription;

    constructor(
        private authorizationService: AuthorizationService,
        private contentService: ContentService,
        private projectService: ProjectService,
    ) {
        this.contentService.getProjects().subscribe(res => {
            this.projects = res.data;
        });
    }

    ngOnInit() {
        this.subscription = this.projectService.navItem$
            .subscribe(res => {
                if (res.type === 'add') {
                    this.projects.push(res);
                } else if (res.type === 'delete') {
                    const index = this.projects.indexOf(this.projects.find(f => f.title === res.title));
                    this.projects.splice(index);
                }
            });
    }

    ngOnDestroy() {
        this.subscription.unsubscribe();
    }

    signOut() {
        // add a confirmation
        this.authorizationService.signOut();
    }

    swithLanguage(btn: string) {
        swithLanguage(btn);
    }
}
