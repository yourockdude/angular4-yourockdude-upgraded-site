export function toggleLoader(state: boolean) {
    const common: HTMLHtmlElement = window.document.getElementsByClassName('common')[0] as HTMLHtmlElement;
    const loader: HTMLHtmlElement = window.document.getElementsByClassName('loader_wrapper')[0] as HTMLHtmlElement;
    if (state) {
        common.style.display = 'none';
        loader.style.display = 'flex';
    } else {
        common.style.display = 'block';
        loader.style.display = 'none';
    }
}

export function getRandomLoader() {
    return `/assets/images/preloader-${Math.floor(Math.random() * 2) + 1}.png`;
}
