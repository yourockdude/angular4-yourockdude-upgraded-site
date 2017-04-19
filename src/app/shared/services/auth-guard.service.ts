import { Injectable } from '@angular/core';
import {
    CanActivate,
    Router,
} from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { AuthorizationService } from './authorization.service';

@Injectable()
export class AuthGuard implements CanActivate {
    authorizationPath = 'authorization';

    constructor(
        private authorizationService: AuthorizationService,
        private router: Router,
    ) { }

    canActivate() {
        return Observable.create((observer: any) => {
            const user = this.authorizationService.getUser();
            if (!user) {
                observer.next(false);
                this.router.navigate([this.authorizationPath]);
            } else {
                observer.next(true);
            }
            observer.complete();
        });

    }
}
