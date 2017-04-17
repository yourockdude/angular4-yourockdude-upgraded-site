import { NgModule } from '@angular/core';
import { SharedModule } from '../shared/shared.module';

import { AboutComponent, AboutRoutingModule } from './index';
import { DescriptionModule } from '../description/index';

@NgModule({
    imports: [
        AboutRoutingModule,
        DescriptionModule,
        SharedModule,
    ],
    exports: [],
    declarations: [AboutComponent],
    providers: [],
})
export class AboutModule { }
