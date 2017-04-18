import { Component, OnInit } from '@angular/core';
import { DescriptionService } from '../shared/services/description.service';
import { Project } from '../shared/models/project';
import { Observable } from 'rxjs/Rx';
import { LoaderService } from '../shared/services/loader.service';

@Component({
    moduleId: module.id,
    selector: 'app-yourock-home',
    templateUrl: 'home.component.html',
    providers: [DescriptionService],
})

export class HomeComponent implements OnInit {
    projects: Project[];
    isLoaded: boolean;
    test: any;

    state = 'in';

    constructor(
        private descriptionService: DescriptionService,
        private loaderService: LoaderService,
    ) {
        this.loaderService.emitChange(false);
        this.descriptionService.getTestHomeContent()
            .subscribe(res => {
                this.projects = res;
                this.loaderService.emitChange(true);
            });
    }

    ngOnInit() { }
}
