import { Component, OnInit } from '@angular/core';
import { AuthorizationService } from '../shared/services/authorization.service';

@Component({
    moduleId: module.id,
    selector: 'app-yourock-admin',
    templateUrl: 'admin.component.html'
})

export class AdminComponent implements OnInit {
    constructor(
        private authorizationService: AuthorizationService
    ) { }

    ngOnInit() { }

    signOut() {
        // add a confirmation
        this.authorizationService.signOut();
    }
}
