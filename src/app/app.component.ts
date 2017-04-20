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
  isLoginPage: boolean;

  constructor(
    private loaderService: LoaderService,
    private elementRef: ElementRef,
    private router: Router,
    private location: Location,
  ) {
    router.events.subscribe((val: RoutesRecognized) => {
      const pattern = /\/admin(\/\([\w]+:[\w-]+\))?|\/authorization/;
      if (pattern.test(val.url)) {
        this.isLoginPage = true;
      } else {
        this.isLoginPage = false;
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
