import { Component, OnInit, AfterViewInit, ElementRef } from '@angular/core';
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

export class HomeComponent implements OnInit, AfterViewInit {
    title: string;
    projects: Project[];
    isLoaded: boolean;
    test: any;

    state = 'in';

    constructor(
        private descriptionService: DescriptionService,
        private loaderService: LoaderService,
        private elementRef: ElementRef,
    ) {
        this.loaderService.emitChange(true);
        this.descriptionService.getTestHomeContent()
            .subscribe(res => {
                const timer = Observable.timer(3000);
                timer.subscribe(() => {
                    this.title = res.text;
                    this.projects = res.projects;
                    this.loaderService.emitChange(false);
                });
            });
    }

    ngOnInit() { }

    ngAfterViewInit() {
        const script = document.createElement('script');
        script.type = 'text/javascript';
        script.innerHTML = `new cbpScroller(document.getElementById('cbp-so-scroller'))`;
        this.elementRef.nativeElement.appendChild(script);
    }
}
