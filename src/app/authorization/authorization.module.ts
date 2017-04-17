import { NgModule } from '@angular/core';
import { AuthorizationComponent, AuthorizationRoutingModule } from './index';
import { SharedModule } from '../shared/shared.module';
import { AuthorizationService } from '../shared/services/authorization.service';

@NgModule({
    imports: [
        AuthorizationRoutingModule,
        SharedModule,
    ],
    exports: [],
    declarations: [AuthorizationComponent],
    providers: [AuthorizationService],
})
export class AuthorizationModule { }
