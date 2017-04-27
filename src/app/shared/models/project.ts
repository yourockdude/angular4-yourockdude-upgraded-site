export class Project {
    id?: string;
    title: string;
    text: string;
    lang?: string;
    product_file?: any;
    site: {
        title: string,
        link: string,
    };
    media: {
        type: string,
        src: string,
    };
    constructor() {
        this.title = '';
        this.text = '';
        this.lang = '';
        this.site = { title: '', link: '' };
        this.media = { src: '', type: '' };
    }
}
