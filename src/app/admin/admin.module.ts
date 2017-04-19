import { NgModule } from '@angular/core';
import { AdminComponent } from './admin.component';
import { AdminRoutingModule } from './index';
import { AuthGuard } from '../shared/services/auth-guard.service';

@NgModule({
    imports: [AdminRoutingModule],
    exports: [],
    declarations: [AdminComponent],
    providers: [AuthGuard],
})
export class AdminModule { }
