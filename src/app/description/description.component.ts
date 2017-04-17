import { Component, OnInit, Input } from '@angular/core';
import { Description } from '../shared/models/description';

@Component({
    moduleId: module.id,
    selector: 'app-yourock-description',
    templateUrl: 'description.component.html'
})

export class DescriptionComponent implements OnInit {
    @Input() description: Description;

    constructor() { }

    ngOnInit() { }
}
