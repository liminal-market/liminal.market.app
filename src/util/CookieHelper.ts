

export default class CookieHelper {
    document: Document

    constructor(document: Document) {
        this.document = document;
    }

    public setCookieNetwork = (name: string) => {
        this.document.cookie = "network=" + name + "; expires=Mon, 2 Dec 2024 12:00:00 UTC;path=/";
        let i = 0;
    }

    public getCookieValue = (name: string) => (
        this.document.cookie.match('(^|;)\\s*' + name + '\\s*=\\s*([^;]+)')?.pop() || ''
    )
}