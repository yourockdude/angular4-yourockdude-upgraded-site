import { NgModule, ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { NavbarComponent } from './navbar/navbar.component';
import { FooterComponent } from './footer/footer.component';
import { MaterializeModule } from 'ng2-materialize';
/**
 * Do not specify providers for modules that might be imported by a lazy loaded module.
 */

@NgModule({
    imports: [
        CommonModule,
        RouterModule,
        MaterializeModule.forRoot(),
    ],
    declarations: [NavbarComponent, FooterComponent],
    exports: [
        CommonModule,
        FormsModule,
        RouterModule,
        NavbarComponent,
        FooterComponent,
        MaterializeModule,
    ]
})
export class SharedModule {
    static forRoot(): ModuleWithProviders {
        return {
            ngModule: SharedModule,
            providers: []
        };
    }
}
