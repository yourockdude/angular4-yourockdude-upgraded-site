import { Component, OnInit } from '@angular/core';
import { ContentService } from '../../shared/services/content.service';
import { clone } from '../../shared/utils/clone-object';

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
            if (res.success) {
                this.contacts = res.data.socialLinks;
            }
        });
    }

    ngOnInit() { }

    edit() {
        this.editing = true;
        this.editContacts = clone(this.contacts);
    }

    save() {
        this.contentService.editContacts(this.editContacts)
            .subscribe(res => {
                this.editing = false;
                this.contacts = clone(this.editContacts);
            });
    }

    cancel() {
        this.editing = false;
        this.editContacts = clone(this.contacts);
    }
}
