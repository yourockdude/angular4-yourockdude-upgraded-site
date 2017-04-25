import { Component, OnInit } from '@angular/core';
import {
    Router,
    RoutesRecognized,
    ActivatedRoute,
    NavigationStart,
    NavigationEnd,
} from '@angular/router';

import { ContentService } from '../../shared/services/content.service';
import { Project } from '../../shared/models/project';
import { environment } from '../../../environments/environment';

@Component({
    moduleId: module.id,
    selector: 'app-yourock-single-project',
    templateUrl: 'single-project.component.html'
})

export class SingleProjectComponent implements OnInit {
    project: Project;
    editing = false;
    editProject: Project;
    id: string;

    constructor(
        private router: Router,
        private contentService: ContentService,
        private activatedRoute: ActivatedRoute
    ) {
        router.events.subscribe((val: NavigationEnd) => {
            if (val instanceof NavigationEnd) {
                this.id = this.activatedRoute.snapshot.url[1].path;
                this.contentService.getProjectById(this.id).subscribe(res => {
                    res.data.media.src = [environment.contentUrl, res.data.media.src].join('');
                    this.project = res.data;
                    console.log(this.project);
                });
            }
        });
    }

    ngOnInit() { }

    edit() {
        this.editing = true;
        this.editProject = this.project;
    }

    save() {
        const src = this.project.media.src.split('http://yourockdudeapi.herokuapp.com/').pop();
        this.editProject.media = {
            type: this.project.media.type,
            src: src,
        };
        this.editProject.media = this.project.media;
        this.contentService.editProject(this.id, this.editProject)
            .subscribe(res => {
                if (res.success) {
                    this.editing = false;
                    this.project = this.editProject;
                }
            });
    }

    cancel() {
        this.editing = false;
        this.editProject = this.project;
    }
}
