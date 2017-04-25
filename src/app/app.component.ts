import {
  Component,
  ElementRef,
  OnInit,
  AfterViewInit
} from '@angular/core';
import {
  Router,
  NavigationStart,
  NavigationEnd,
  RoutesRecognized
} from '@angular/router';
import { Location } from '@angular/common';
import { Observable, Subscription } from 'rxjs/Rx';

import { LoaderService } from './shared/services/loader.service';

import 'rxjs/add/operator/pairwise';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit, AfterViewInit {

  testLoader: boolean;
  showNavbar: boolean;
  showFooter: boolean;

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
    router.events.subscribe((val: RoutesRecognized) => {
      const pattern = /^\/(about)?$/;
      const navbarPattern = /^\/admin(\/\(.+\))?$/;
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

  ngAfterViewInit(): void { }
}
