import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AuthorizationComponent } from './authorization.component';

const routes: Routes = [
  { path: 'authorization', component: AuthorizationComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AuthorizationRoutingModule { }

export const routedComponents = [AuthorizationComponent];
