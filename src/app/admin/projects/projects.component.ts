import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { ContentService } from '../../shared/services/content.service';
import { Project } from '../../shared/models/project';
import { environment } from '../../../environments/environment';
import { ProjectService } from '../../shared/services/project.service';
import { Subscription } from 'rxjs/Subscription';

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
    subscription: Subscription;
    selectedItemIndex: string;
    selectedItemId: string;
    isDbClick = false;

    constructor(
        private contentService: ContentService,
        private projectService: ProjectService,
        private router: Router,
        private activatedRoute: ActivatedRoute,
    ) {
        this.contentService.getProjects().subscribe(res => {
            res.data.map(project => {
                project.media.src = [environment.contentUrl, project.media.src].join('');
            });
            this.projects = res.data;
        });
    }

    ngOnInit() {
    }

    add() {
        this.adding = true;
    }

    save() {
        const formData = new FormData();
        formData.append('product_file', this.file);
        this.contentService.uploadMedia(formData).subscribe(res => {
            if (res.success) {
                this.contentService.addProject(this.newProject).subscribe(response => {
                    response.data.media.src = [environment.contentUrl, response.data.media.src].join('');
                    this.projects.push(response.data);
                    this.projectService.changeNav({ type: 'add', obj: response.data });
                    this.adding = false;
                });
            }
        });
    }

    cancel() {
        this.adding = false;
    }

    delete() {
        this.contentService.deleteProject(this.selectedItemId)
            .subscribe(res => {
                this.projectService.changeNav();
                const index = this.projects.indexOf(this.projects.find(f => f.id === this.selectedItemId));
                this.projects.splice(index, 1);
            });
    }

    onProjectClick(id: string, index: string) {
        this.selectedItemId = id;
        this.selectedItemIndex = index;
    }

    onProjectDbClick(id: string) {
        this.isDbClick = true;
        this.router.navigate(
            [{ outlets: { 'sidebar': ['project', id] } }],
            { relativeTo: this.activatedRoute }
        );
    }

    fileChange(event) {
        this.file = event.target.files[0];

        const reader = new FileReader();
        reader.onload = (e: any) => {
            this.url = e.target.result;
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
