import { Component, OnInit, ElementRef, AfterViewInit } from '@angular/core';

@Component({
    moduleId: module.id,
    selector: 'app-yourock-note-found',
    templateUrl: 'not-found.component.html'
})

export class NotFoundComponent implements OnInit, AfterViewInit {
    constructor(
        private elementRef: ElementRef
    ) { }

    ngOnInit() {
    }

    ngAfterViewInit(): void {
        const script = document.createElement('script');
        script.type = 'text/javascript';
        script.src = '../../assets/3rd-scripts/game.js';
        this.elementRef.nativeElement.appendChild(script);
    }
}
