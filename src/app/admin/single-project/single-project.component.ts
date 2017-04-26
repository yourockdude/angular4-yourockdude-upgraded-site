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
import { clone } from '../../shared/utils/clone-object';

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
    file: File;
    url: any;

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
                });
            }
        });
    }

    ngOnInit() { }

    edit() {
        this.editing = true;
        this.editProject = clone(this.project);
        this.url = this.editProject.media.src;
    }

    save() {
        this.editProject.media.src = this.editProject.media.src.split(environment.contentUrl).pop();
        this.contentService.editProject(this.id, this.editProject)
            .subscribe(res => {
                if (res.success) {
                    this.editing = false;
                    this.editProject.media.src = [environment.contentUrl, this.editProject.media.src].join('');
                    this.project = clone(this.editProject);
                }
            });
    }

    cancel() {
        this.editing = false;
        this.editProject = clone(this.project);
    }

    fileChange(event) {
        this.file = event.target.files[0];

        const reader = new FileReader();
        // tslint:disable-next-line:no-shadowed-variable
        reader.onload = (event: any) => {
            this.url = event.target.result;
        };
        reader.readAsDataURL(this.file);

        if (this.file.type === 'image/png') {
            this.editProject.media.type = 'image';
            this.editProject.media.src = `images/${this.file.name}`;
        } else {
            this.editProject.media.type = 'video';
            this.editProject.media.src = `video/${this.file.name}`;
        }
    }
}
