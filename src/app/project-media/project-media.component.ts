import { Component, OnInit, Input } from '@angular/core';
import { Project } from 'app/shared/models/project';

@Component({
    moduleId: module.id,
    selector: 'app-yourock-project-media',
    templateUrl: 'project-media.component.html'
})

export class ProjectMediaComponent implements OnInit {
    @Input() index: number;
    @Input() project: Project;

    constructor() { }

    ngOnInit() { }
}
