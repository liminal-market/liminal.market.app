

export default class CookieHelper {
    document: Document

    constructor(doc?: Document) {
        this.document = (doc) ? doc : document;
    }

    public setCookie(name: string, value: string) {
        let date = new Date();
        this.deleteCookie(name);
        this.document.cookie = name + "=" + value + "; expires=Mon, 2 Dec " + (date.getFullYear() + 1) + " 12:00:00 UTC;path=/;SameSite=Strict;";
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