import { NgModule } from '@angular/core';
import { AdminComponent } from './admin.component';
import { AdminRoutingModule } from './index';
import { AuthGuard } from '../shared/services/auth-guard.service';
import { ContentService } from '../shared/services/content.service';
import { MainPageComponent } from './main-page/main-page.component';
import { SharedModule } from '../shared/shared.module';

@NgModule({
    imports: [
        AdminRoutingModule,
        SharedModule,
    ],
    exports: [
        SharedModule
    ],
    declarations: [AdminComponent, MainPageComponent],
    providers: [AuthGuard, ContentService],
})
export class AdminModule { }
