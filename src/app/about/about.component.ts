import { Component, OnInit } from '@angular/core';
import { ContentService } from '../shared/services/content.service';
import { Description } from '../shared/models/description';
import { environment } from '../../environments/environment';
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
    selector: 'app-yourock-about',
    templateUrl: 'about.component.html',
    providers: [ContentService],
    animations: [
        trigger('fadeIn', [
            state('in', style({ opacity: 1 })),
            state('void', style({ opacity: 0 })),
            transition('* <=> *', animate('3000ms')),
        ])
    ]
})

export class AboutComponent implements OnInit {
    aboutContent: any;

    constructor(private contentService: ContentService) {
        this.contentService.getAboutPage()
            .subscribe(res => {
                if (res.success) {
                    res.data.awards.leftPart.image = [environment.contentUrl, res.data.awards.leftPart.image].join('');
                    res.data.awards.rightPart.image = [environment.contentUrl, res.data.awards.rightPart.image].join('');
                    this.aboutContent = res.data;
                }
            });
    }

    ngOnInit() { }
}
