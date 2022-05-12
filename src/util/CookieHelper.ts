

export default class CookieHelper {
    document: Document

    constructor(document: Document) {
        this.document = document;
    }

    public setCookie(name : string, value : string) {
        let date = new Date();
        this.document.cookie = name + "=" + value + "; expires=Mon, 2 Dec 2024 12:00:00 UTC;path=/";
    }

    public setCookieNetwork = (name: string) => {
        this.setCookie("network", name);
    }

    public getCookieValue(name: string) {
        return this.document.cookie.match('(^|;)\\s*' + name + '\\s*=\\s*([^;]+)')?.pop() || '';
    }

    public setCookieProvider(providerName: string) {
       this.setCookie("provider", providerName);
    }

    public deleteCookie(name: string) {
        this.document.cookie = name + "=0; expires=Mon, 2 Dec 2020 12:00:00 UTC;path=/";
    }
}