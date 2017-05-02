import { Component, OnInit, ViewContainerRef } from '@angular/core';
import { Router } from '@angular/router';
import { User } from '../shared/models/user';
import { AuthorizationService } from '../shared/services/authorization.service';
import { ToastsManager } from 'ng2-toastr/ng2-toastr';

@Component({
    moduleId: module.id,
    selector: 'app-yourock-authorization',
    templateUrl: 'authorization.component.html',
    providers: [ToastsManager],
})

export class AuthorizationComponent implements OnInit {
    user: User = new User();
    token: string;
    adminPath = '/admin';

    constructor(
        private authorizationService: AuthorizationService,
        private router: Router,
        private toastsManager: ToastsManager,
        private vcr: ViewContainerRef,
    ) {
        this.toastsManager.setRootViewContainerRef(vcr);
    }

    ngOnInit() {
        if (localStorage.getItem('id_token')) {
            this.router.navigate([this.adminPath]);
        }
    }

    signIn() {
        this.authorizationService.signIn(this.user)
            .subscribe(res => {
                if (res.success) {
                    this.router.navigate([this.adminPath]);
                } else {
                    this.toastsManager.error('you shall not pass');
                }
            });
    }
}
