import {
    Component,
    OnInit,
    AfterViewInit,
    ViewChild,
    ElementRef,
} from '@angular/core';
import {
    trigger,
    state,
    style,
    animate,
    transition,
    keyframes,
} from '@angular/animations';
import { EmailService } from '../services/email.service';
declare const $: JQueryStatic;

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
            ),
        ])
    ],
    providers: [EmailService],
})

export class NavbarComponent implements OnInit, AfterViewInit {

    @ViewChild('select') select: ElementRef;

    state = 'closed';
    file: File;
    name: string;
    phone: string;
    email: string;
    message: string;
    theme: string;

    constructor(private emailService: EmailService) { }

    ngOnInit() { }

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

        $('.sel__box__options').click(function () {
            const txt = $(this).text();
            const index = $(this).index();

            $(this).siblings('.sel__box__options').removeClass('selected');
            $(this).addClass('selected');

            const $currentSel = $(this).closest('.sel');
            $currentSel.children('.sel__placeholder').text(txt);
            $currentSel.children('select').prop('selectedIndex', index + 1);
        });
    }

    showHireUsForm() {
        this.state = (this.state === 'opened' ? 'closed' : 'opened');
        console.log(this.state);
    }

    fileChange(event) {
        this.file = event.target.files[0];
    }

    sendEmail() {
        const formData: FormData = new FormData();
        formData.append('name', this.name);
        formData.append('phone', this.phone);
        formData.append('email', this.email);
        formData.append('message', this.message);
        formData.append('theme', this.select.nativeElement.textContent);
        formData.append('file_for_email', this.file, this.file.name);
        this.emailService.sendEmail(formData).subscribe(res => {
            if (res.success) {
                // TODO add info for user
                this.showHireUsForm();
            }
        });
    }
}
