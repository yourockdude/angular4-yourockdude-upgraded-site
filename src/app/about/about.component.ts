import { Component, OnInit } from '@angular/core';
import { DescriptionService } from '../shared/services/description.service';
import { Description } from '../shared/models/description';

@Component({
    moduleId: module.id,
    selector: 'app-yourock-about',
    templateUrl: 'about.component.html',
    providers: [DescriptionService]
})

export class AboutComponent implements OnInit {
    descriptions: Description[] = [];
    constructor(private descriptionService: DescriptionService) {
        this.descriptionService.getTestAboutContent()
            .subscribe(res => {
                this.descriptions = res;
            });
    }

    ngOnInit() { }
}
