import { Component, OnInit } from '@angular/core';
import {
    Router,
    RoutesRecognized,
    ActivatedRoute,
    NavigationStart,
    NavigationEnd,
} from '@angular/router';
import { Ng2FileDropAcceptedFile } from 'ng2-file-drop';

import { ContentService } from '../../shared/services/content.service';
import { ProjectService } from '../../shared/services/project.service';
import { ValidationService } from '../../shared/services/validation.service';

import { Project } from '../../shared/models/project';
import { environment } from '../../../environments/environment';
import { clone } from '../../shared/utils/clone-object';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { toggleLoader } from '../../shared/utils/loader';

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
    noImage = false;
    editProjectForm: FormGroup;

    constructor(
        private activatedRoute: ActivatedRoute,
        private contentService: ContentService,
        private formBuilder: FormBuilder,
        private projectService: ProjectService,
        private router: Router,
    ) {
        toggleLoader(true, 'edit_page', 'holder');
        this.router.events.subscribe((val: NavigationEnd) => {
            if (val instanceof NavigationEnd) {
                this.id = this.activatedRoute.snapshot.url[1].path;
                this.contentService.getProjectById(this.id).subscribe(res => {
                    if (res.success) {
                        res.data.media.src = [environment.contentUrl, res.data.media.src].join('');
                        this.project = res.data;
                        if (this.project.media.src.split(environment.contentUrl).pop() === '') {
                            this.noImage = true;
                        } else {
                            this.noImage = false;
                        }
                        this.editProject = clone(this.project);
                        this.editing = this.activatedRoute.snapshot.queryParams['editing'];
                        if (this.editing) {
                            this.buildForm();
                        }
                        // tslint:disable-next-line:max-line-length
                        this.url = this.editProject.media.src === environment.contentUrl ? '/assets/images/no-image.png' : this.editProject.media.src;
                        toggleLoader(false, 'edit_page', 'holder');
                    }
                });
            }
        });
    }

    ngOnInit() { }

    buildForm() {
        this.editProjectForm = this.formBuilder.group({
            'title': [this.project.title, Validators.required],
            'text': [this.project.text, Validators.required],
            'siteLink': [this.project.site.link, [Validators.required, ValidationService.siteValidator]],
            'siteTitle': [this.project.site.title, Validators.required],
        });
    }

    edit() {
        this.buildForm();
        this.editing = true;
        this.url = this.noImage ? '/assets/images/no-image.png' : this.editProject.media.src;
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
        this.editProject = {
            id: this.editProject.id,
            site: {
                title: this.editProjectForm.value.siteTitle,
                link: this.editProjectForm.value.siteLink,
            },
            text: this.editProjectForm.value.text,
            title: this.editProjectForm.value.title,
            media: {
                src: this.editProject.media.src.split(environment.contentUrl).pop(),
                type: this.editProject.media.type,
            }
        };
        if (this.file) {
            this.noImage = false;
            const formData = new FormData();
            formData.append('product_file', this.file);
            this.contentService.uploadMedia(formData)
                .subscribe(res => {
                    if (res.success) {
                        this.editProject.media = res.data.media;
                        this.editProjectCommonPart();
                    }
                });
        } else {
            this.editProjectCommonPart();
        }
    }

    editProjectCommonPart() {
        this.contentService.editProject(this.id, this.editProject)
            .subscribe(response => {
                if (response.success) {
                    this.editing = false;
                    this.projectService.changeNav({ type: 'edit', obj: response.data });
                    this.editProject.media.src = [environment.contentUrl, this.editProject.media.src].join('');
                    this.project = clone(this.editProject);
                }
            });
    }

    cancel() {
        this.editing = false;
        this.buildForm();
    }

    fileChange(event) {
        this.readFile(event.target.files[0]);
    }

    dragFileAccepted(acceptedFile: Ng2FileDropAcceptedFile) {
        this.readFile(acceptedFile.file);
    }

    // TODO move to utils;
    readFile(file: File) {
        this.file = file;

        const reader = new FileReader();
        reader.onload = (e: any) => {
            this.url = e.target.result;
        };
        reader.readAsDataURL(this.file);
        this.editProject.media.type = /image/.test(this.file.type.split('/')[0]) ? 'image' : 'video';
    }
}
