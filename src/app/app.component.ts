import { Component, ElementRef, OnInit, OnDestroy } from '@angular/core';
import { LoaderService } from './shared/services/loader.service';
import {
  Router,
  NavigationStart,
  NavigationEnd,
  RoutesRecognized
} from '@angular/router';
import { Location } from '@angular/common';
import { Observable, Subscription } from 'rxjs/Rx';
import 'rxjs/add/operator/pairwise';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit, OnDestroy {
  private _routeScrollPositions: { [url: string]: number } = {};
  private _subscriptions: Subscription[] = [];

  testLoader: boolean;
  showNavbarNFooter: boolean;

  currentLanguage: string;

  constructor(
    private loaderService: LoaderService,
    private elementRef: ElementRef,
    private router: Router,
    private location: Location,
  ) {
    if (!localStorage.getItem('current_language')) {
      localStorage.setItem('current_language', 'ru');
    };
    console.log('current language ', localStorage.getItem('current_language'));
    router.events.subscribe((val: RoutesRecognized) => {
      // const pattern = /\/admin(\/\([\w]+:[\w-]+\))?|\/authorization/;
      const pattern = /^\/(about)?$/;
      console.log(val.url, pattern.test(val.url));
      if (pattern.test(val.url)) {
        this.showNavbarNFooter = false;
      } else {
        this.showNavbarNFooter = true;
      }
    });

    this.loaderService.changeEmitted$.subscribe(
      loader => {
        this.testLoader = loader;
      }
    );
  }

  ngOnInit() {
    this.router.events.subscribe((evt) => {
      if (!(evt instanceof NavigationEnd)) {
        return;
      }
      window.scrollTo(0, 0);
    });
  }

  ngOnDestroy() {
    this._subscriptions.forEach(subscription => subscription.unsubscribe());
  }
}
