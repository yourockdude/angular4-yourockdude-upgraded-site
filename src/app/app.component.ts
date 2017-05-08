import {
  Component,
  ElementRef,
  OnInit,
  OnDestroy,
} from '@angular/core';
import {
  Router,
  NavigationStart,
  NavigationEnd,
  RoutesRecognized,
  Event as RouterEvent,
  NavigationCancel,
  NavigationError
} from '@angular/router';
import { Location } from '@angular/common';
import { Observable, Subscription } from 'rxjs/Rx';
import { LoaderService } from './shared/services/loader.service';
import { AuthorizationService } from './shared/services/authorization.service';
import { toggleLoader, getRandomLoader } from './shared/utils/loader';
import 'rxjs/add/operator/pairwise';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  providers: [AuthorizationService, LoaderService]
})
export class AppComponent implements OnInit, OnDestroy {

  testLoader: boolean;
  showNavbar: boolean;
  showFooter: boolean;
  loaderSrc = '/assets/images/preloader-2.png';
  subscription: Subscription;

  currentLanguage: string;

  constructor(
    private authorizationService: AuthorizationService,
    private loaderService: LoaderService,
    private elementRef: ElementRef,
    private router: Router,
    private location: Location,
  ) {
    this.authorizationService.scheduleRefresh();
    if (!localStorage.getItem('current_language')) {
      const domain = window.location.href.split('.').slice(-1).pop();
      if (/com/.test(domain)) {
        localStorage.setItem('current_language', 'en');
      } else {
        localStorage.setItem('current_language', 'ru');
      }
    };
    router.events.subscribe((val: RoutesRecognized) => {
      const pattern = /^\/(about)?$/;
      const navbarPattern = /^(\/admin(\/\(.+\))?(\?.+)?)|(\/authorization)$/;
      if (pattern.test(val.url)) {
        this.showFooter = true;
      } else {
        this.showFooter = false;
      };
      if (navbarPattern.test(val.url)) {
        this.showNavbar = false;
      } else {
        this.showNavbar = true;
      }
    });
  }

  ngOnInit() {
    this.subscription = this.loaderService.changeEmitted$.subscribe(res => {
      this.loaderSrc = res;
    });
    this.router.events.subscribe((evt) => {
      if (!(evt instanceof NavigationEnd)) {
        return;
      }
      window.scrollTo(0, 0);
    });
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}
