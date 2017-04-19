import { Component, ElementRef } from '@angular/core';
import { LoaderService } from './shared/services/loader.service';
import { Router, RoutesRecognized } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  testLoader: boolean;
  isLoginPage: boolean;

  constructor(
    private loaderService: LoaderService,
    private elementRef: ElementRef,
    private router: Router
  ) {
    router.events.subscribe((val: RoutesRecognized) => {
      switch (val.url) {
        case '/authorization':
          this.isLoginPage = true;
          break;
        case '/admin':
          this.isLoginPage = true;
          break;
        default:
          this.isLoginPage = false;
          break;
      }
    });

    this.loaderService.changeEmitted$.subscribe(
      loader => {
        this.testLoader = loader;
      }
    );
  }
}
