import { Component, OnInit } from '@angular/core';
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
    constructor(private authorizationService: AuthorizationService) { }

    ngOnInit() { }

    signIn() {
        this.authorizationService.signIn(this.user)
            .subscribe(res => {
                if (res.success === true) {
                    this.token = res.data;
                    alert('token:' + this.token);
                }
                console.log(res);
            });
    }
}
