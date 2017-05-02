import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule, Http, RequestOptions } from '@angular/http';

import { ToastModule } from 'ng2-toastr/ng2-toastr';
import { AuthHttp, AuthConfig, AUTH_PROVIDERS } from 'angular2-jwt/angular2-jwt';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';

import { HomeModule } from './home/home.module';
import { AboutModule } from './about/about.module';
import { SharedModule } from './shared/shared.module';
import { NotFoundModule } from './not-found/not-found.module';
import { AuthorizationModule } from './authorization/authorization.module';
import { AdminModule } from './admin/admin.module';

import { LoaderService } from './shared/services/loader.service';

export function authHttpServiceFactory(
  http: Http,
  options: RequestOptions
) {
  return new AuthHttp(
    new AuthConfig({ noTokenScheme: true }),
    http,
    options
  );
}

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
    AdminModule,
    ToastModule.forRoot(),
    NotFoundModule, // Always should be at the end
  ],
  providers: [
    LoaderService,
    AuthHttp,
    {
      provide: AuthHttp,
      useFactory: authHttpServiceFactory,
      deps: [Http, RequestOptions]
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
