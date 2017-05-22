import { Component, OnInit, OnDestroy, ElementRef } from '@angular/core';
import { ActivatedRoute, Router, NavigationEnd } from '@angular/router';

import { AuthorizationService } from '../shared/services/authorization.service';
import { ContentService } from '../shared/services/content.service';
import { ProjectService } from '../shared/services/project.service';

import { swithLanguage } from '../shared/utils/swith-language';
import { Subscription } from 'rxjs/Rx';
import { JwtHelper } from 'angular2-jwt';

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
    jwtHelper: JwtHelper = new JwtHelper();
    user: string;
    language: string;

    constructor(
        private authorizationService: AuthorizationService,
        private contentService: ContentService,
        private projectService: ProjectService,
        private activatedRoute: ActivatedRoute,
        private router: Router,
        private elementRef: ElementRef,
    ) {
        const isSwithed = (localStorage.getItem('switched') === 'true');
        const isProj = (this.activatedRoute.children[0].url as any).value.find(v => v.path === 'project');
        if (isSwithed && (isProj !== undefined)) {
            this.router.navigate(
                [{ outlets: { 'sidebar': ['projects'] } }],
                {
                    relativeTo: this.activatedRoute,
                }
            );
            localStorage.setItem('switched', 'false');
        }
        this.user = this.jwtHelper.decodeToken(localStorage.getItem('token')).name;
        this.language = localStorage.getItem('current_language');
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
        localStorage.setItem('switched', 'true');
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
