import { NgModule } from '@angular/core';
import { AdminRoutingModule } from './index';
import { AdminComponent } from './admin.component';
import { SharedModule } from '../shared/shared.module';

import { AuthGuard } from '../shared/services/auth-guard.service';
import { ContentService } from '../shared/services/content.service';

import { MainPageComponent } from './main-page/main-page.component';
import { AgencyComponent } from './agency/agency.component';
import { ProjectsComponent } from './projects/projects.component';
import { SingleProjectComponent } from './single-project/single-project.component';
import { ContactsComponent } from './contacts/contacts.component';

@NgModule({
    imports: [
        AdminRoutingModule,
        SharedModule,
    ],
    exports: [
        SharedModule
    ],
    declarations: [
        AdminComponent,
        MainPageComponent,
        AgencyComponent,
        ProjectsComponent,
        SingleProjectComponent,
        ContactsComponent,
    ],
    providers: [AuthGuard, ContentService],
})
export class AdminModule { }
