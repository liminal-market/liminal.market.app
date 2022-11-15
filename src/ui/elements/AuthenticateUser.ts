import Moralis from "moralis";
import UserService from "../../services/backend/UserService";
import UserInfo from "./UserInfo";
import ConnectWallet from "../modals/ConnectWallet";
import LoadingHelper from "../../util/LoadingHelper";

export default class AuthenticateUser {

    moralis: typeof Moralis;

    constructor(moralis: typeof Moralis) {
        this.moralis = moralis;
    }

    public async authenticate() {
        let userService = new UserService(this.moralis);
        let user = userService.getUser();

        if (!user) {
            let connectWallet = new ConnectWallet(this.moralis);
            connectWallet.renderButton('user_header_info');
            return;
        }

        let user_header_info = document.getElementById('user_header_info');
        if (user_header_info) user_header_info.innerHTML = 'Loading wallet..';
        LoadingHelper.setLoading(user_header_info);

        user = await userService.isLoggedIn();
        if (user) {
            let userInfo = new UserInfo(this.moralis, (user as any).providerInfo, user);
            await userInfo.render('user_header_info');
        } else {
            //show Connect Wallet button
            let connectWallet = new ConnectWallet(this.moralis);
            connectWallet.renderButton('user_header_info');
        }

        LoadingHelper.removeLoading();
    }

}