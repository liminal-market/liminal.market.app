import {InfoBarType} from "./InfoBarType";

export default class InfoBar {

    public static show(message : string, type : InfoBarType, timeoutInSeconds : number = 4) {
        let infoBar = document.getElementById('infoBar');
        if (!infoBar) {
            infoBar = document.createElement('div');
            infoBar.classList.add('notificationBar');
            document.body.insertAdjacentElement('beforeend', infoBar);
        };

        infoBar.innerHTML = message;
        infoBar.classList.remove('d-none');
        infoBar.classList.remove(InfoBarType.Info);
        infoBar.classList.remove(InfoBarType.Warning);
        infoBar.classList.remove(InfoBarType.Error);
        infoBar.classList.add(type)
        if (timeoutInSeconds > 0) {
            setTimeout(() => {
                infoBar?.classList.add('d-none');
            }, timeoutInSeconds * 1000);
        }
    }
}