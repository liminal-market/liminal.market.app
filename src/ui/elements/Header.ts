import AuthenticateService from "../../services/backend/AuthenticateService";
import ConnectWallet from "../modals/ConnectWallet";
import UserInfo from "./UserInfo";
import App from "../../main";

export default class Header {

    public async load() {
        this.loadImage();
        await this.showUserOptions()
    }

    public async loadImage() {
        let header = document.querySelector('body > header') as HTMLElement;
        if (!header) return;

        let random = Math.floor(Math.random() * 10);

        header.style.backgroundImage = "url(/img/header/" + random + ".jpg)";
    }

    public async showUserOptions() {
        let authenticationService = new AuthenticateService();
        let isAuthenticated = await authenticationService.isAuthenticated();

        if (!isAuthenticated) {
            let connectWallet = new ConnectWallet();
            connectWallet.renderButton('user_header_info');
            return;
        }

        let userInfo = new UserInfo(App.User.providerInfo);
        await userInfo.render('user_header_info');
    }

}