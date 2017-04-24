import { Component, OnInit } from '@angular/core';
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
    title: string;
    static: any;
    in = 'in';

    constructor(
        private contentService: ContentService,
        private loaderService: LoaderService,
    ) {
        this.loaderService.emitChange(false);
        this.contentService.getHomeTitle('main')
            .subscribe(res => {
                this.title = res.data.title;
            });
        this.contentService.getProjects()
            .subscribe(res => {
                res.data.map(project => {
                    project.media.src = [environment.contentUrl, project.media.src].join('');
                });
                this.projects = res.data;
                this.loaderService.emitChange(true);
            });
        this.contentService.getStaticHome()
            .subscribe(res => this.static = res);
    }

    ngOnInit() { }

}
