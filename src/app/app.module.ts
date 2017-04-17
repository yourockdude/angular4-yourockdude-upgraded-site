import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';

import { HomeModule } from './home/home.module';
import { AboutModule } from './about/about.module';
import { SharedModule } from './shared/shared.module';
import { NotFoundModule } from './not-found/not-found.module';
import { AuthorizationModule } from './authorization/authorization.module';

import { LoaderService } from './shared/services/loader.service';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
    AppRoutingModule,
    SharedModule,
    HomeModule,
    AboutModule,
    AuthorizationModule,
    NotFoundModule,
  ],
  providers: [LoaderService],
  bootstrap: [AppComponent]
})
export class AppModule { }
