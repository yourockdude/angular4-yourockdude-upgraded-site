import { Component, OnInit } from '@angular/core';
import { ContentService } from '../../shared/services/content.service';

@Component({
    moduleId: module.id,
    selector: 'app-yourock-projects',
    templateUrl: 'projects.component.html'
})

export class ProjectsComponent implements OnInit {
    projects: any[];
    constructor(private contentService: ContentService) {
        this.contentService.getProjects().subscribe(res => {
            this.projects = res.data;
        });
    }

    ngOnInit() { }
}
