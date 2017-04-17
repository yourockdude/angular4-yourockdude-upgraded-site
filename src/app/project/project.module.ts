import { NgModule } from '@angular/core';
import { SharedModule } from '../shared/shared.module';

import { ProjectComponent } from './index';
import { ProjectMediaComponent } from '../project-media/project-media.component';
import { ProjectTitleComponent } from '../project-title/project-title.component';

@NgModule({
    imports: [SharedModule],
    exports: [ProjectComponent],
    declarations: [
        ProjectComponent,
        ProjectMediaComponent,
        ProjectTitleComponent,
    ],
    providers: [],
})
export class ProjectModule { }
