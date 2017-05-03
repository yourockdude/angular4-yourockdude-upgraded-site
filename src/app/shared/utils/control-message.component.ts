import { Component, Input } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { ValidationService } from '../services/validation.service';

@Component({
    selector: 'app-yourock-control-messages',
    template: `<sup class="error-message" *ngIf="errorMessage !== null">{{errorMessage}}</sup>`
})
export class ControlMessagesComponent {
    @Input() control: FormControl;
    constructor() { }

    get errorMessage() {
        for (const propertyName in this.control.errors) {
            // && this.control.touched
            if (this.control.errors.hasOwnProperty(propertyName)) {
                return ValidationService.getValidatorErrorMessage(propertyName, this.control.errors[propertyName]);
            }
        }
        return null;
    }
}
