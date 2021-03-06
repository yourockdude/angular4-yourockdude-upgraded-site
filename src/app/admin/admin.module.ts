import { NgModule } from '@angular/core';
import { Ng2FileDropModule } from 'ng2-file-drop';
import { AdminRoutingModule } from './index';
import { AdminComponent } from './admin.component';
import { SharedModule } from '../shared/shared.module';

import { AuthGuard } from '../shared/services/auth-guard.service';
import { ContentService } from '../shared/services/content.service';
import { ProjectService } from '../shared/services/project.service';

import { MainPageComponent } from './main-page/main-page.component';
import { AgencyComponent } from './agency/agency.component';
import { ProjectsComponent } from './projects/projects.component';
import { SingleProjectComponent } from './single-project/single-project.component';
import { ContactsComponent } from './contacts/contacts.component';

@NgModule({
    imports: [
        AdminRoutingModule,
        SharedModule.forRoot(),
        Ng2FileDropModule,
    ],
    exports: [
        SharedModule,
        Ng2FileDropModule,
    ],
    declarations: [
        AdminComponent,
        MainPageComponent,
        AgencyComponent,
        ProjectsComponent,
        SingleProjectComponent,
        ContactsComponent,
    ],
    providers: [
        AuthGuard,
        ContentService,
        ProjectService,
    ],
})
export class AdminModule { }
