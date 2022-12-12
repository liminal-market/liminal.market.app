import NetworkInfo from "../../networks/NetworkInfo";
import SwitchNetworkModal from "../../ui/modals/SwitchNetworkModal";
import MagicWeb3Connector from "../../wallet/MagicWeb3Connector";
import App from "../../main";
import BaseService from "./BaseService";
import CookieHelper from "../../util/CookieHelper";
import User from "../../dto/User";

export default class AuthenticateService extends BaseService {

    public constructor() {
        super();
    }

    public static async enableWeb3() {
        if (App.User.connector) return App.User.connector;

        let magicWeb3Connector = new MagicWeb3Connector();
        let connector = await magicWeb3Connector.activate();
        App.User.connector = connector;
        App.User.magic = connector.magic;
        App.User.provider = connector.provider;
        App.User.ether = connector.ether;
        App.User.signer = connector.signer;

        return connector;
    }

    public async logOut() {
        let cookieHelper = new CookieHelper(document);
        cookieHelper.deleteCookie('validate');
        if (!App.User.ether) {
            let connection = await AuthenticateService.enableWeb3();
            App.User.magic = connection.magic;
        }
        App.User.magic.connect.disconnect();
        App.User = new User(null, '', App.Network.ChainId, '');
    }

    public async login() {
        let connector = await AuthenticateService.enableWeb3();
        App.User = new User(connector.provider, connector.account, connector.chainId, connector.ether);
        App.User.magic = connector.magic;
        App.User.signer = connector.signer;
        App.User.isLoggedIn = true;
    }

    public async isAuthenticated() {
        let cookieHelper = new CookieHelper();
        let validate = cookieHelper.getCookieValue('validate');
        if (!validate) return false;

        try {
            let obj = JSON.parse(atob(validate));
            App.User.token = obj.token;

            let result = await this.post('/me/jwt');
            console.log('isValid', result);
            if (!result.jwt) {
                await this.logOut();
                return false;
            }

            await AuthenticateService.enableWeb3();

            App.User.address = obj.address;
            App.User.alpacaId = obj.alpacaId;
            App.User.chainId = obj.chainId;
            App.User.isLoggedIn = true;

            return true;
        } catch (e: any) {
            cookieHelper.deleteCookie('validate');

            console.info(e);
            return false;
        }

    }

    public async authenticateUser(enableWeb3Callback?: (walletConnectionInfo: any) => void,
                                  authenticatedCallback?: () => void
    ) {

        let connector = await AuthenticateService.enableWeb3();

        if (enableWeb3Callback && connector.provider) {
            enableWeb3Callback(connector.provider);
        }

        if (connector.chainId != App.Network.ChainId) {
            let userNetwork = NetworkInfo.getNetworkInfoByChainId(connector.chainId);
            if (userNetwork) {
                NetworkInfo.setNetworkByChainId(connector.chainId);
            } else {
                let modal = new SwitchNetworkModal();
                modal.show();
                return;
            }
        }

        let response = await this.post<any>('/me/nonce', {address: connector.account})

        let obj: any = {
            signingMessage: "You are logging into Liminal.market.\n\nNonce:" + response.nonce,
            connector: MagicWeb3Connector
        };

        const signedMessage = await connector.ether.getSigner()
            .signMessage(obj.signingMessage)
            .catch((e: any) => console.log(e));

        let loginResponse = await this.post<any>('me/validate', {address: connector.account, signedMessage})
        App.User.setValidate(loginResponse);
        App.User.token = loginResponse.token;
        App.User.alpacaId = loginResponse.alpacaId;
        App.User.address = loginResponse.address;
        App.User.isLoggedIn = true;

        if (authenticatedCallback) {
            authenticatedCallback();
        } else {
            location.reload();
        }
    }


}