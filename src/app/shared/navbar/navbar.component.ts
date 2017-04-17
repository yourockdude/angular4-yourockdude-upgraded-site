import { Component, OnInit } from '@angular/core';
import {
    trigger,
    state,
    style,
    animate,
    transition,
    keyframes,
} from '@angular/animations';

@Component({
    moduleId: module.id,
    selector: 'app-yourock-navbar',
    templateUrl: 'navbar.component.html',
    animations: [
        trigger('showHireUsForm', [
            state('closed', style({ 'display': 'none' })),
            state('opened',
                style({ 'display': 'block', 'transform': 'translateX(0%)' }),
            ),
            transition(
                'opened => closed', [
                    animate('2s')
                ]
            ),
            // transition('closed => closed', style({ 'display': 'none' }))
        ])
    ]
})

export class NavbarComponent implements OnInit {
    state = 'closed';
    constructor() { }

    ngOnInit() { }

    showHireUsForm() {
        this.state = (this.state === 'opened' ? 'closed' : 'opened');
        console.log(this.state);
    }
}
