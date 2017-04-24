import { Component, OnInit } from '@angular/core';
import { ContentService } from '../shared/services/content.service';
import { Description } from '../shared/models/description';
import { environment } from '../../environments/environment';

@Component({
    moduleId: module.id,
    selector: 'app-yourock-about',
    templateUrl: 'about.component.html',
    providers: [ContentService]
})

export class AboutComponent implements OnInit {
    aboutContent: any;

    constructor(private contentService: ContentService) {
        this.contentService.getAboutPage()
            .subscribe(res => {
                res.data.awards.leftPart.image = [environment.contentUrl, res.data.awards.leftPart.image].join('');
                res.data.awards.rightPart.image = [environment.contentUrl, res.data.awards.rightPart.image].join('');
                this.aboutContent = res.data;
            });
    }

    ngOnInit() { }
}
