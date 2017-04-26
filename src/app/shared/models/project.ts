export class Project {
    id?: string;
    title: string;
    text: string;
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
        this.site = { title: '', link: '' };
        this.media = { src: '', type: '' };
    }
}
