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
  RoutesRecognized,
  Event as RouterEvent,
  NavigationCancel,
  NavigationError
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
  loaderSrc = '/assets/images/preloader-2.png';

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
      const navbarPattern = /^\/admin(\/\(.+\))?(\?.+)?$/;
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
    router.events.subscribe((event: RouterEvent) => {
      if (!(/^\/admin(\/\(.+\))?(\?.+)?$/.test((event as RoutesRecognized).url))) {
        this.navigationInterceptor(event);
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

  getRandomLoader() {
    this.loaderSrc = `/assets/images/preloader-${Math.floor(Math.random() * 2) + 1}.png`;
  }

  navigationInterceptor(event: RouterEvent): void {
    const common: HTMLHtmlElement = window.document.getElementsByClassName('common')[0] as HTMLHtmlElement;
    const loader: HTMLHtmlElement = window.document.getElementsByClassName('loader_wrapper')[0] as HTMLHtmlElement;
    if (event instanceof NavigationStart) {
      this.getRandomLoader();
      common.style.display = 'none';
      loader.style.display = 'flex';
    }
    if (event instanceof NavigationEnd) {
      setTimeout(() => {
        common.style.display = 'block';
        loader.style.display = 'none';
      }, 1000);
    }
  }
}
