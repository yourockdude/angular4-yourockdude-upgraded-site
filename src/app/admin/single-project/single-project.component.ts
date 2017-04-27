import { Component, OnInit } from '@angular/core';
import {
    Router,
    RoutesRecognized,
    ActivatedRoute,
    NavigationStart,
    NavigationEnd,
} from '@angular/router';

import { ContentService } from '../../shared/services/content.service';
import { ProjectService } from '../../shared/services/project.service';

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
        private activatedRoute: ActivatedRoute,
        private projectService: ProjectService,
    ) {
        router.events.subscribe((val: NavigationEnd) => {
            if (val instanceof NavigationEnd) {
                this.id = this.activatedRoute.snapshot.url[1].path;
                this.contentService.getProjectById(this.id).subscribe(res => {
                    if (res.success) {
                        res.data.media.src = [environment.contentUrl, res.data.media.src].join('');
                        this.project = res.data;
                    }
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

    delete() {
        this.contentService.deleteProject(this.id).subscribe(res => {
            if (res.success) {
                this.projectService.changeNav({ type: 'delete', obj: res.data });
                this.router.navigate(['/admin']);
            }
        });
    }

    save() {
        this.editProject.media.src = this.editProject.media.src.split(environment.contentUrl).pop();
        if (this.file) {
            const formData = new FormData();
            formData.append('product_file', this.file);
            this.contentService.uploadMedia(formData).subscribe(res => {
                if (res.success) {
                    this.contentService.editProject(this.id, this.editProject).subscribe(response => {
                        this.editing = false;
                        this.editProject.media.src = [environment.contentUrl, this.editProject.media.src].join('');
                        this.project = clone(this.editProject);
                    });
                }
            });
        } else {
            this.contentService.editProject(this.id, this.editProject)
                .subscribe(res => {
                    if (res.success) {
                        this.editing = false;
                        this.editProject.media.src = [environment.contentUrl, this.editProject.media.src].join('');
                        this.project = clone(this.editProject);
                    }
                });
        }
    }

    cancel() {
        this.editing = false;
        this.editProject = clone(this.project);
    }

    fileChange(event) {
        this.file = event.target.files[0];

        const reader = new FileReader();
        reader.onload = (e: any) => {
            this.url = e.target.result;
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
