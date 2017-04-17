import { Component, OnInit, Input, AfterViewInit, ElementRef } from '@angular/core';
import { Project } from '../shared/models/project';

@Component({
    moduleId: module.id,
    selector: 'app-yourock-project',
    templateUrl: 'project.component.html'
})

export class ProjectComponent implements OnInit, AfterViewInit {
    @Input() index: number;
    @Input() project: Project;

    constructor(
        private elementRef: ElementRef
    ) { }

    ngOnInit() { }

    ngAfterViewInit() {
        const script = document.createElement('script');
        script.type = 'text/javascript';
        script.innerHTML = `new cbpScroller(document.getElementById('cbp-so-scroller'))`;
        this.elementRef.nativeElement.appendChild(script);
    }

}
