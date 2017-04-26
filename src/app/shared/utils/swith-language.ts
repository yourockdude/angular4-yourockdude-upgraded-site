export function swithLanguage(btn: string) {
    const common: HTMLHtmlElement = window.document.getElementsByClassName('common')[0] as HTMLHtmlElement;
    const loader: HTMLHtmlElement = window.document.getElementsByClassName('loader-area')[0] as HTMLHtmlElement;
    if (btn === 'en') {
        if (localStorage.getItem('current_language') === 'ru') {
            localStorage.setItem('current_language', 'en');
            window.location.reload();
            // common.style.display = 'none';
            // loader.style.display = 'block';
        }
    } else {
        if (localStorage.getItem('current_language') === 'en') {
            localStorage.setItem('current_language', 'ru');
            window.location.reload();
            // common.style.display = 'none';
            // loader.style.display = 'block';
        }
    }
}
