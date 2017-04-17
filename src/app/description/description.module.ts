import { NgModule } from '@angular/core';
import { SharedModule } from '../shared/shared.module';

import { DescriptionComponent } from './index';

@NgModule({
    imports: [SharedModule],
    exports: [DescriptionComponent],
    declarations: [DescriptionComponent],
    providers: [],
})
export class DescriptionModule { }
