import {
    Component,
    OnInit,
    ElementRef,
    AfterViewInit
} from '@angular/core';
import { game } from '../../assets/3rd-scripts/game';

@Component({
    moduleId: module.id,
    selector: 'app-yourock-note-found',
    templateUrl: 'not-found.component.html',
    styleUrls: ['./not-found.component.css'],
})

export class NotFoundComponent implements OnInit, AfterViewInit {
    constructor(
        private elementRef: ElementRef
    ) { }

    ngOnInit() { }

    ngAfterViewInit(): void {
        game();
    }
}
