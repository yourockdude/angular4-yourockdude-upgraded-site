import { Component, OnInit } from '@angular/core';
import { ContentService } from '../../shared/services/content.service';

@Component({
    moduleId: module.id,
    selector: 'app-yourock-contacts',
    templateUrl: 'contacts.component.html'
})

export class ContactsComponent implements OnInit {
    contacts: any[];
    editing = false;
    editContacts: any[];

    constructor(
        private contentService: ContentService,
    ) {
        this.contentService.getContacts().subscribe(res => {
            this.contacts = res;
            console.log(this.contacts);
        });
    }

    ngOnInit() { }

    edit() {
        this.editing = true;
        this.editContacts = this.contacts;
        // this.editText = this.title;
    }

    save() {
        this.editing = false;
        this.contacts = this.editContacts;
        console.log(this.editContacts.map(m => m.link));
        // this.contentService.editHomeTitle(this.editText)
        //     .subscribe(res => {
        //         if (res.success) {
        //             this.editing = false;
        //             this.title = this.editText;
        //         }
        //     });
    }

    cancel() {
        this.editing = false;
        this.editContacts = this.contacts;
    }
}
