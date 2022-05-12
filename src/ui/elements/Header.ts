export default class Header {

    public static loadImage() {
        let header = document.querySelector('body > header') as HTMLElement;
        if (!header) return;

        let random = Math.floor(Math.random() * 10);

        header.style.backgroundImage = "url(/img/header/" + random + ".jpg)";
    }
}