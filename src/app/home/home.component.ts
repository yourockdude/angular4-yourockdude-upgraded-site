import { Component, OnInit } from '@angular/core';
import { ContentService } from '../shared/services/content.service';
import { Project } from '../shared/models/project';
import { Observable } from 'rxjs/Rx';
import { LoaderService } from '../shared/services/loader.service';
import { environment } from '../../environments/environment';

@Component({
    moduleId: module.id,
    selector: 'app-yourock-home',
    templateUrl: 'home.component.html',
    providers: [ContentService],
})

export class HomeComponent implements OnInit {

    projects: Project[];
    title: string;

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
    }

    ngOnInit() { }
}
