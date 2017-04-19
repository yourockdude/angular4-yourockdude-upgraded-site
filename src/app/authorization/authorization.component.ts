import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { User } from '../shared/models/user';
import { AuthorizationService } from '../shared/services/authorization.service';

@Component({
    moduleId: module.id,
    selector: 'app-yourock-authorization',
    templateUrl: 'authorization.component.html'
})

export class AuthorizationComponent implements OnInit {
    user: User = new User();
    token: string;
    adminPath = '/admin';

    constructor(
        private authorizationService: AuthorizationService,
        private router: Router,
    ) { }

    ngOnInit() { }

    signIn() {
        this.authorizationService.signIn(this.user)
            .subscribe(res => {
                if (res.success) {
                    this.router.navigate([this.adminPath]);
                } else {
                    // TODO add toaster
                    alert('error');
                }
            });
    }
}
