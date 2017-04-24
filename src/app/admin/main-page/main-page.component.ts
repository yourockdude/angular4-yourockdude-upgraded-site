import { Component, OnInit } from '@angular/core';
import { ContentService } from '../../shared/services/content.service';

@Component({
    moduleId: module.id,
    selector: 'app-yourock-main-page',
    templateUrl: 'main-page.component.html'
})

export class MainPageComponent implements OnInit {
    title: string;

    constructor(private contentService: ContentService) {
        this.contentService.getHomePage()
            .subscribe(res => {
                this.title = res.data.title;
            });
    }

    ngOnInit() { }
}
