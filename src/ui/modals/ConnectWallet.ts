import UserInfo from "../elements/UserInfo";
import AuthenticateService from "../../services/backend/AuthenticateService";
import ErrorInfo from "../../errors/ErrorInfo";
//import ConnectWalletButton from '../html/ConnectWalletButton.html';

export default class ConnectWallet {
    moralis : typeof Moralis;
    public static Provider : string;

    public constructor(moralis : typeof Moralis) {
        this.moralis = moralis;
        ConnectWallet.Provider = 'metamask';
    }

    public renderButton(elementId : string) : void {
        if (!document.getElementById(elementId)) return;

        document.getElementById(elementId)!.innerHTML = 'ConnectWallet'//ConnectWalletButton;

        let elements = document.querySelectorAll(".connect_wallet");
        elements.forEach(el => {
            el.removeEventListener('click', this.connectWallet);
            el.addEventListener('click', this.connectWallet)
        });
    }

    public chooseWalletProvider(callback: ()=> void) {
        //show modal to connect wallet

        //set provider
        ConnectWallet.Provider = 'metamask';

        //callback
        callback();
    }

    private connectWallet() {
        let moralis = this.moralis;
        let authenticationService = new AuthenticateService(moralis);

        //TODO: provider should be dynamic
        let provider = 'metamask';
        authenticationService.authenticateUser(provider as typeof Moralis.Web3ProviderType).then(async function(response) {
            if (response as typeof Moralis.User)
            {
                let userInfo = new UserInfo(moralis, response as typeof Moralis.User);
                await userInfo.renderUserInfo();
            } else {
                alert((response as ErrorInfo).getErrorInfo());
            }
        })
    }

}