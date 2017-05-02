import { Component, OnInit, ElementRef } from '@angular/core';
import { ContentService } from '../shared/services/content.service';
import { Project } from '../shared/models/project';
import { Observable } from 'rxjs/Rx';
import { LoaderService } from '../shared/services/loader.service';
import { environment } from '../../environments/environment';
import {
    trigger,
    state,
    style,
    animate,
    transition,
    keyframes,
} from '@angular/animations';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
    moduleId: module.id,
    selector: 'app-yourock-home',
    templateUrl: 'home.component.html',
    providers: [ContentService],
    animations: [
        trigger('fadeIn', [
            state('in', style({ opacity: 1 })),
            state('void', style({ opacity: 0 })),
            transition('* <=> *', animate('3000ms')),
        ])
    ]
})

export class HomeComponent implements OnInit {

    projects: Project[];
    homeContent: any;
    contacts: any;
    in = 'in';

    constructor(
        private contentService: ContentService,
        private loaderService: LoaderService,
        private elementRef: ElementRef,
        private domSanitizer: DomSanitizer,
    ) {
        this.loaderService.emitChange(false);
        this.contentService.getHomePage()
            .subscribe(res => {
                this.homeContent = res.data;
                const script = document.createElement('script');
                script.type = 'text/javascript';
                script.src = '../assets/3rd-scripts/common.js';
                this.elementRef.nativeElement.appendChild(script);
            });
        this.contentService.getProjects()
            .subscribe(res => {
                if (res.success) {
                    res.data.map(project => {
                        project.media.src = [environment.contentUrl, project.media.src].join('');
                    });
                    this.projects = this.moveElementInArray(res.data, res.data.find(f => f.title === 'Vesper'), 0);
                    this.loaderService.emitChange(true);
                }
            });
        this.contentService.getContacts().subscribe(res => {
            if (res.success) {
                this.contacts = {
                    email: res.data.socialLinks.find(f => f.name === 'Email').link,
                    telegram: res.data.socialLinks.find(f => f.name === 'Telegram').link,
                    skype: this.domSanitizer.bypassSecurityTrustUrl(res.data.socialLinks.find(f => f.name === 'Skype').link),
                };
            }
        });
    }

    ngOnInit() { }

    moveElementInArray(array: any[], value: any, newPosition?: any) {
        const oldIndex = array.indexOf(value);
        if (oldIndex > -1) {

            if (newPosition < 0) {
                newPosition = 0;
            } else if (newPosition >= array.length) {
                newPosition = array.length;
            }

            const arrayClone = array.slice();
            arrayClone.splice(oldIndex, 1);
            arrayClone.splice(newPosition, 0, value);

            return arrayClone;
        }
        return array;
    }
}
