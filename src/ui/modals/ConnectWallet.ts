import UserInfo from "../elements/UserInfo";
import AuthenticateService from "../../services/backend/AuthenticateService";
import walletButton from '../../html/elements/ConnectWalletButton.html';
import Modal from "./Modal";
import ProviderInfo from "../../wallet/ProviderInfo";
import ErrorInfo from "../../errors/ErrorInfo";
import TradePage from "../pages/TradePage";
import LoadingHelper from "../../util/LoadingHelper";

export default class ConnectWallet {
    public static Provider: string;
    providerInfo: ProviderInfo;

    public constructor() {
        this.providerInfo = new ProviderInfo(null);
    }

    public renderButton(elementId: string): void {
        if (!document.getElementById(elementId)) return;

        document.getElementById(elementId)!.innerHTML = walletButton;

        let elements = document.querySelectorAll(".liminal_market_connect_wallet");
        elements.forEach(async (el) => {
            el.addEventListener('click', async (evt) => {
                evt.preventDefault();
                await this.connectWallet(evt.target as HTMLElement);
            });
        });
    }

    public async connectWallet(button: HTMLElement) {
        LoadingHelper.setLoading(button);

        let authenticationService = new AuthenticateService();
        await authenticationService.authenticateUser(
            (walletConnectionInfo: any) => {
                this.web3EnabledResult(walletConnectionInfo);
            },
            async () => {
                let userInfo = new UserInfo(this.providerInfo);
                await userInfo.render('user_header_info');

                if (document.getElementById('liminal_market_execute_trade')) {
                    let page = new TradePage();
                    await page.load();
                }
            })
            .catch((reason) => {
                ErrorInfo.report(reason);
            }).finally(() => {
                LoadingHelper.removeLoading();
            });
    }

    private web3EnabledResult(walletConnectionInfo: any) {
        this.providerInfo = new ProviderInfo(walletConnectionInfo);
    }
}