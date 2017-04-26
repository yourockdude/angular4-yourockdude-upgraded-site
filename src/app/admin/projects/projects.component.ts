import { Component, OnInit } from '@angular/core';
import { ContentService } from '../../shared/services/content.service';
import { Project } from '../../shared/models/project';

@Component({
    moduleId: module.id,
    selector: 'app-yourock-projects',
    templateUrl: 'projects.component.html'
})

export class ProjectsComponent implements OnInit {
    projects: Project[];
    newProject: Project = new Project();
    adding = false;
    file: File;
    url: string;

    constructor(private contentService: ContentService) {
        this.contentService.getProjects().subscribe(res => {
            this.projects = res.data;
        });
    }

    ngOnInit() {
        console.log(this.newProject);
    }

    add() {
        this.adding = true;
    }

    save() {
        this.adding = false;
        console.log(this.newProject);
    }

    cancel() {
        this.adding = false;
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
            this.newProject.media.type = 'image';
            this.newProject.media.src = `images/${this.file.name}`;
        } else {
            this.newProject.media.type = 'video';
            this.newProject.media.src = `video/${this.file.name}`;
        }
    }

}
