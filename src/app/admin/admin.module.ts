import { NgModule } from '@angular/core';
import { AdminComponent } from './admin.component';
import { AdminRoutingModule } from './index';
import { AuthGuard } from '../shared/services/auth-guard.service';
import { MainPageComponent } from './main-page/main-page.component';

@NgModule({
    imports: [
        AdminRoutingModule,
    ],
    exports: [],
    declarations: [AdminComponent, MainPageComponent],
    providers: [AuthGuard],
})
export class AdminModule { }
