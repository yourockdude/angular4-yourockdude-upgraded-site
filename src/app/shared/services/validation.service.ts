import { Injectable } from '@angular/core';

@Injectable()
export class ValidationService {
    static getValidatorErrorMessage(validatorName: string, validatorValue?: any) {
        let config;
        if (localStorage.getItem('current_language') === 'ru') {
            config = {
                'required': 'Обязательное поле',
                'invalidEmailAddress': `Неправильный формат email'a`,
                'invalidPhoneNumber': 'Неправильный формат номера телефона',
            };
        } else {
            config = {
                'required': 'Field required',
                'invalidEmailAddress': 'Invalid email address',
                'invalidPhoneNumber': 'Invalid phone number',
            };
        }
        return config[validatorName];
    }

    static emailValidator(control) {
        // tslint:disable-next-line:max-line-length
        if (control.value.match(/[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/)) {
            return null;
        } else {
            return { 'invalidEmailAddress': true };
        }
    }

    static phoneValidator(control) {
        if (control.value.match(/^((\+7|7|8)+([0-9]){10})$/)) {
            return null;
        } else {
            return { 'invalidPhoneNumber': true };
        }
    }

    constructor() { }
}
