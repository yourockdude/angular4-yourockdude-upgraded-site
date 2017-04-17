import { NgModule } from '@angular/core';
import { SharedModule } from '../shared/shared.module';

import { ProjectComponent } from './index';

@NgModule({
    imports: [SharedModule],
    exports: [ProjectComponent],
    declarations: [ProjectComponent],
    providers: [],
})
export class ProjectModule { }
