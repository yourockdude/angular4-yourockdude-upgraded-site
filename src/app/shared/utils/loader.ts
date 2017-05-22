export function toggleLoader(state: boolean, commonTag: string, loaderTag: string) {
    const common: HTMLHtmlElement = window.document.getElementsByClassName(commonTag)[0] as HTMLHtmlElement;
    const loader: HTMLHtmlElement = window.document.getElementsByClassName(loaderTag)[0] as HTMLHtmlElement;
    if (state) {
        common.style.display = 'none';
        loader.style.display = 'flex';
    } else {
        common.style.display = 'inline-block';
        loader.style.display = 'none';
    }
}

export function getRandomLoader() {
    return `/assets/images/preloader-${Math.floor(Math.random() * 2) + 1}.png`;
}
