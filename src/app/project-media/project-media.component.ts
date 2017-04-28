import { Component, OnInit, Input } from '@angular/core';
import { Project } from 'app/shared/models/project';
import { environment } from '../../environments/environment';

@Component({
    moduleId: module.id,
    selector: 'app-yourock-project-media',
    templateUrl: 'project-media.component.html'
})

export class ProjectMediaComponent implements OnInit {
    @Input() index: number;
    @Input() project: Project;
    noImage = false;

    constructor() { }

    ngOnInit() {
        if (this.project.media.src.split(environment.contentUrl).pop() === '') {
            this.noImage = true;
        }
    }
}
