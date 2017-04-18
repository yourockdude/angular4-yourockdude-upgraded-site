import { Component, OnInit } from '@angular/core';
import { ContentService } from '../shared/services/content.service';
import { Description } from '../shared/models/description';

@Component({
    moduleId: module.id,
    selector: 'app-yourock-about',
    templateUrl: 'about.component.html',
    providers: [ContentService]
})

export class AboutComponent implements OnInit {
    descriptions: Description[] = [];
    constructor(private contentService: ContentService) {
        this.contentService.getTestAboutContent()
            .subscribe(res => {
                this.descriptions = res;
            });
    }

    ngOnInit() { }
}
