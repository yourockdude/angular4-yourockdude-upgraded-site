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
    projects: Project[] = [];
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
            if (res.success) {
                res.data.map(project => {
                    project.media.src = [environment.contentUrl, project.media.src].join('');
                });
                this.projects = res.data;
            }
        });
    }

    ngOnInit() {

    }

    add() {
        this.adding = true;
    }

    save() {
        if (this.file) {
            const formData = new FormData();
            formData.append('product_file', this.file);
            this.contentService.uploadMedia(formData).subscribe(res => {
                if (res.success) {
                    this.newProject.media = res.data.media;
                    this.contentService.addProject(this.newProject).subscribe(response => {
                        response.data.media.src = [environment.contentUrl, response.data.media.src].join('');
                        this.projects.push(response.data);
                        this.projectService.changeNav({ type: 'add', obj: response.data });
                        this.adding = false;
                        this.newProject = new Project();
                    });
                }
            });
        } else {
            this.contentService.addProject(this.newProject).subscribe(response => {
                response.data.media.src = [environment.contentUrl, response.data.media.src].join('');
                this.projects.push(response.data);
                this.projectService.changeNav({ type: 'add', obj: response.data });
                this.adding = false;
                this.newProject = new Project();
            });
        }
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

    edit() {
        this.router.navigate(
            [{ outlets: { 'sidebar': ['project', this.selectedItemId] } }],
            {
                relativeTo: this.activatedRoute,
                queryParams: { 'editing': true },
            }
        );
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
        this.newProject.media.type = /image/.test(this.file.type.split('/')[0]) ? 'image' : 'video';
    }

    noImage(src: string) {
        if (src.split(environment.contentUrl).pop() === '') {
            return true;
        } else {
            return false;
        }
    }
}
