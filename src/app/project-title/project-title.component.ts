import { Component, OnInit, Input } from '@angular/core';
import { Project } from 'app/shared/models/project';

@Component({
    moduleId: module.id,
    selector: 'app-yourock-project-title',
    templateUrl: 'project-title.component.html'
})

export class ProjectTitleComponent implements OnInit {
    @Input() index: number;
    @Input() project: Project;

    constructor() { }

    ngOnInit() { }
}
