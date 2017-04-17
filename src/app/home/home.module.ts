import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { Ng2PageScrollModule } from 'ng2-page-scroll';
import { Ng2ScrollimateModule } from 'ng2-scrollimate';

import { SharedModule } from '../shared/shared.module';
import { HomeComponent, HomeRoutingModule } from './index';
import { ProjectModule } from '../project/index';

@NgModule({
    imports: [
        CommonModule,
        HomeRoutingModule,
        Ng2PageScrollModule.forRoot(),
        ProjectModule,
        SharedModule,
        BrowserAnimationsModule,
        Ng2ScrollimateModule,
    ],
    exports: [],
    declarations: [HomeComponent],
    providers: [],
})
export class HomeModule { }
