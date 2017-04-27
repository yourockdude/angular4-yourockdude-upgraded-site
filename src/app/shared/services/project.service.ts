import { Injectable } from '@angular/core';
import { Subject } from 'rxjs/Rx';

@Injectable()
export class ProjectService {
    // Observable navItem source
    private _navItemSource = new Subject<any>();
    // Observable navItem stream
    navItem$ = this._navItemSource.asObservable();
    // service command
    changeNav(number) {
        this._navItemSource.next(number);
    }
}
