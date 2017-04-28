import { Component, OnInit, OnDestroy, ElementRef } from '@angular/core';
import { ActivatedRoute, Router, NavigationEnd } from '@angular/router';

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
    selectedItem: string;
    path: string;
    navigationItems: any[];

    constructor(
        private authorizationService: AuthorizationService,
        private contentService: ContentService,
        private projectService: ProjectService,
        private activatedRoute: ActivatedRoute,
        private router: Router,
        private elementRef: ElementRef,
    ) {
        this.router.events.subscribe((val: any) => {
            this.path = (this.activatedRoute.firstChild.url as any).value.map(v => v.path).join('/');
        });
        this.contentService.getProjects().subscribe(res => {
            this.projects = res.data;
            this.navigationItems = this.elementRef.nativeElement.getElementsByClassName('navigation-item');
        });
    }

    ngOnInit() {
        this.subscription = this.projectService.navItem$
            .subscribe(res => {
                this.contentService.getProjects().subscribe(r => {
                    this.projects = r.data;
                });
                // if (res.type === 'add') {

                // } else if (res.type === 'delete') {
                //     const index = this.projects.indexOf(this.projects.find(f => f.id === res.id));
                //     this.projects.splice(index);
                // } else if (res.type === 'edit') {
                //     const index = this.projects.indexOf(this.projects.find(f => f.id === res.id));
                //     this.projects.splice(index);
                //     this.projects.push(res);
                // }
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

    onItemClick(e: MouseEvent, part: string, id?: string) {
        const parts = id ? [part, id] : [part];
        this.router.navigate(
            [{ outlets: { 'sidebar': parts } }],
            {
                relativeTo: this.activatedRoute,
            }
        );
    }
}
