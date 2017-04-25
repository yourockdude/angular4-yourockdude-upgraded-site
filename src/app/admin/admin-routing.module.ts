import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AuthGuard } from '../shared/services/auth-guard.service';

import { AdminComponent } from './admin.component';
import { MainPageComponent } from './main-page/main-page.component';
import { AgencyComponent } from './agency/agency.component';
import { ProjectsComponent } from './projects/projects.component';
import { SingleProjectComponent } from './single-project/single-project.component';
import { ContactsComponent } from './contacts/contacts.component';

const routes: Routes = [
    {
        path: 'admin',
        component: AdminComponent,
        canActivate: [AuthGuard],
        children: [
            {
                path: 'main-page',
                component: MainPageComponent,
                outlet: 'sidebar',
            },
            {
                path: 'agency',
                component: AgencyComponent,
                outlet: 'sidebar',
            },
            {
                path: 'projects',
                component: ProjectsComponent,
                outlet: 'sidebar',
            },
            {
                path: 'project/:id',
                component: SingleProjectComponent,
                outlet: 'sidebar',
            },
            {
                path: 'contacts',
                component: ContactsComponent,
                outlet: 'sidebar',
            },
        ]
    },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class AdminRoutingModule { }

export const routedComponents = [AdminComponent];
