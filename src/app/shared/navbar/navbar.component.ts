import {
    Component,
    OnInit,
    AfterViewInit,
    ViewChild,
    ElementRef,
    ViewContainerRef,
} from '@angular/core';
import {
    trigger,
    state,
    style,
    animate,
    transition,
    keyframes,
} from '@angular/animations';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import { ToastsManager } from 'ng2-toastr/ng2-toastr';
import { EmailService } from '../services/email.service';
import { ContentService } from '../services/content.service';
import { ValidationService } from '../services/validation.service';
import { swithLanguage } from '../utils/swith-language';
import * as $ from 'jquery';
declare const el: JQuery;

@Component({
    moduleId: module.id,
    selector: 'app-yourock-navbar',
    templateUrl: 'navbar.component.html',
    animations: [
        trigger('showHireUsForm', [
            state('closed', style({ 'display': 'none' })),
            state('opened',
                style({ 'display': 'block', 'transform': 'translateX(0%)' }),
            ),
            transition(
                'opened => closed', [
                    animate('2s')
                ]
            )
        ])
    ],
    providers: [
        EmailService,
        ToastsManager,
        ContentService,
        ValidationService
    ],
})

export class NavbarComponent implements OnInit, AfterViewInit {
    @ViewChild('select') select: ElementRef;

    hireUsForm: FormGroup;

    state = 'closed';
    file: File;
    theme: string;
    fileName: string;

    navbar: any;
    hireUsFormText: any;

    sendingEmail: boolean;

    constructor(
        private emailService: EmailService,
        private toastsManager: ToastsManager,
        private contentService: ContentService,
        private vcr: ViewContainerRef,
        private formBuilder: FormBuilder,
    ) {
        this.toastsManager.setRootViewContainerRef(vcr);
        this.contentService.getNavbar().subscribe(res => {
            this.navbar = res.data;
        });
        this.contentService.getHireUsForm().subscribe(res => {
            this.hireUsFormText = res.data;
        });
    }

    ngOnInit() {
        this.buildForm();
    }

    ngAfterViewInit(): void {
        (function ($) {
            $.fn.selectbox = function () {

                const selectDefaultHeight = $('#selectBox').height();
                const rotateDefault = 'rotate(0deg)';
                $('#selectBox > p.valueTag').click(function () {
                    const currentHeight = $('#selectBox').height();
                    if (currentHeight < 100 || currentHeight === selectDefaultHeight) {
                        $('#selectBox').height('250px');
                    }
                    if (currentHeight >= 250) {
                        $('#selectBox').height(selectDefaultHeight);
                        $('img.arrow').css({ transform: rotateDefault });
                    }
                });
                $('li.option').click(function () {
                    $('#selectBox').height(selectDefaultHeight);
                    $('img.arrow').css({ transform: rotateDefault });
                    $('p.valueTag').text($(this).text());
                });
            };
        })(jQuery);


        $('.sel').each(function () {
            $(this).children('select').css('display', 'none');

            const $current = $(this);

            $(this).find('option').each(function (i) {
                if (i === 0) {
                    $current.prepend($('<div>', {
                        class: $current.attr('class').replace(/sel/g, 'sel__box')
                    }));

                    const placeholder = $(this).text();
                    $current.prepend($('<span>', {
                        class: $current.attr('class').replace(/sel/g, 'sel__placeholder'),
                        text: placeholder,
                        'data-placeholder': placeholder
                    }));

                    return;
                }

                $current.children('div').append($('<span>', {
                    class: $current.attr('class').replace(/sel/g, 'sel__box__options'),
                    text: $(this).text()
                }));
            });
        });

        $('.sel').click(function () {
            $(this).toggleClass('active');
        });
    }

    buildForm() {
        this.hireUsForm = this.formBuilder.group({
            'name': ['', Validators.required],
            'phone': ['', [Validators.required, ValidationService.phoneValidator]],
            'email': ['', [Validators.required, ValidationService.emailValidator]],
            'message': ['', Validators.required],
        });
    }

    showHireUsForm() {
        this.state = (this.state === 'opened' ? 'closed' : 'opened');
    }

    fileChange(event) {
        this.file = event.target.files[0];
        this.fileName = this.file.name;
    }

    sendEmail() {
        if (this.hireUsForm.dirty && this.hireUsForm.valid) {
            this.sendingEmail = true;
            const formData: FormData = new FormData();
            formData.append('name', this.hireUsForm.value.name);
            formData.append('phone', this.hireUsForm.value.phone);
            formData.append('email', this.hireUsForm.value.email);
            formData.append('message', this.hireUsForm.value.message);
            formData.append('theme', this.theme ? this.theme : 'Без темы');
            formData.append('file_for_email', this.file);
            this.emailService.sendEmail(formData).subscribe(res => {
                if (res.success) {
                    this.showHireUsForm();
                    this.buildForm();
                    this.file = null;
                    this.theme = '';
                    this.sendingEmail = false;
                    if (localStorage.getItem('current_language') === 'ru') {
                        this.toastsManager.success('Ваше сообщение отправлено');
                    } else {
                        this.toastsManager.success('Yours message has been send');
                    }
                }
            });
        }
    }

    swithLanguage(btn: string) {
        swithLanguage(btn);
    }

    onSubjectClick(event: any) {
        this.select.nativeElement.innerText = event.target.innerText;
        this.theme = event.target.innerText;
    }
}
