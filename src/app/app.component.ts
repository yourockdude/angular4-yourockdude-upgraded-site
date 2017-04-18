import { Component, ElementRef } from '@angular/core';
import { LoaderService } from './shared/services/loader.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  testLoader: boolean;

  constructor(
    private loaderService: LoaderService,
    private elementRef: ElementRef,
  ) {
    this.loaderService.changeEmitted$.subscribe(
      loader => {
        this.testLoader = loader;
      }
    );
  }
}
