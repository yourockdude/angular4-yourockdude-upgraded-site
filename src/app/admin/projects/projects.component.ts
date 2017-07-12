import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { ContentService } from '../../shared/services/content.service';
import { ValidationService } from '../../shared/services/validation.service';
import { Project } from '../../shared/models/project';
import { environment } from '../../../environments/environment';
import { ProjectService } from '../../shared/services/project.service';
import { Subscription } from 'rxjs/Subscription';

import { Ng2FileDropAcceptedFile, Ng2FileDropRejectedFile } from 'ng2-file-drop';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { toggleLoader } from '../../shared/utils/loader';

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
    newProjectForm: FormGroup;

    constructor(
        private activatedRoute: ActivatedRoute,
        private contentService: ContentService,
        private formBuilder: FormBuilder,
        private projectService: ProjectService,
        private router: Router,
    ) {
        toggleLoader(true, 'edit_page', 'holder');
        this.contentService.getProjects().subscribe(res => {
            if (res.success) {
                res.data.map(project => {
                    project.media.src = [environment.contentUrl, project.media.src].join('');
                });
                this.projects = res.data;
                toggleLoader(false, 'edit_page', 'holder');
            }
        });
    }

    ngOnInit() {
        this.buildForm();
    }

    buildForm() {
        this.newProjectForm = this.formBuilder.group({
            'title': ['', Validators.required],
            'text': ['', Validators.required],
            'siteLink': ['', [Validators.required, ValidationService.siteValidator]],
            'siteTitle': ['', Validators.required],
        });
    }

    add() {
        this.adding = true;
    }

    save() {
        this.newProject = {
            title: this.newProjectForm.value.title,
            text: this.newProjectForm.value.text,
            media: this.newProject.media,
            site: {
                link: this.newProjectForm.value.siteLink,
                title: this.newProjectForm.value.siteTitle,
            },
        };
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
                if (res.success) {
                    this.projectService.changeNav();
                    const index = this.projects.indexOf(this.projects.find(f => f.id === this.selectedItemId));
                    this.projects.splice(index, 1);
                }
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

    onProjectPressKey(e: KeyboardEvent, id: string) {
        e.stopPropagation();
        e.preventDefault();
        if (e.keyCode === 46) {
            this.delete();
        } else if (e.keyCode === 13) {
            this.onProjectDbClick(id);
        }
    }

    fileChange(event) {
        this.readFile(event.target.files[0]);
    }

    noImage(src: string) {
        if (src.split(environment.contentUrl).pop() === '') {
            return true;
        } else {
            return false;
        }
    }

    dragFileAccepted(acceptedFile: Ng2FileDropAcceptedFile) {
        this.readFile(acceptedFile.file);
    }

    // TODO move to utils 
    readFile(file: File) {
        this.file = file;

        const reader = new FileReader();
        reader.onload = (e: any) => {
            this.url = e.target.result;
        };
        reader.readAsDataURL(this.file);
        this.newProject.media.type = /image/.test(this.file.type.split('/')[0]) ? 'image' : 'video';
    }
}
