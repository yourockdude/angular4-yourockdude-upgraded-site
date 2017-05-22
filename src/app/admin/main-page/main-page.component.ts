import { Component, OnInit } from '@angular/core';
import { ContentService } from '../../shared/services/content.service';
import { toggleLoader } from '../../shared/utils/loader';

@Component({
    moduleId: module.id,
    selector: 'app-yourock-main-page',
    templateUrl: 'main-page.component.html'
})

export class MainPageComponent implements OnInit {
    title: string;
    editing = false;
    editText: string;

    constructor(
        private contentService: ContentService
    ) {
        toggleLoader(true, 'edit_page', 'holder');
        this.contentService.getHomePage()
            .subscribe(res => {
                this.title = res.data.title;
                toggleLoader(false, 'edit_page', 'holder');
            });
    }

    ngOnInit() { }

    edit() {
        this.editing = true;
        this.editText = this.title;
    }

    save() {
        this.contentService.editHomeTitle(this.editText)
            .subscribe(res => {
                if (res.success) {
                    this.editing = false;
                    this.title = this.editText;
                }
            });
    }

    cancel() {
        this.editing = false;
        this.editText = this.title;
    }

}
