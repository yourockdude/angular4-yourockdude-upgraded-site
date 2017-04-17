import { Component, OnInit, Input } from '@angular/core';
import { Project } from '../shared/models/project';

@Component({
    moduleId: module.id,
    selector: 'app-yourock-project',
    templateUrl: 'project.component.html'
})

export class ProjectComponent implements OnInit {
    @Input() project: Project;

    constructor() { }

    ngOnInit() { }
}
