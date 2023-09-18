import NetworkInfo from "../../networks/NetworkInfo";
import SwitchNetworkModal from "../../ui/modals/SwitchNetworkModal";
import MagicWeb3Connector from "../../wallet/MagicWeb3Connector";
import App from "../../main";
import BaseService from "./BaseService";
import CookieHelper from "../../util/CookieHelper";
import User from "../../dto/User";
import {showBar} from "../../util/Helper";
import WalletHelper from "../../util/WalletHelper";
import LiminalMarket from "liminal.market";
import {Account} from "liminal.market/dist/dto/Account";

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
        App.User.magic?.connect.disconnect();
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
        let cookieHelper = new CookieHelper(document);
        if (!App.User.magic && !cookieHelper.getCookieValue('validate')) {
            console.log('ble')
            return false;
        }

        let provider = await AuthenticateService.enableWeb3();
        let liminalMarket = await LiminalMarket.getInstance(provider.ether, '0x19d5ABE7854b01960D4911e6536b26F8A38C3a18')
            .catch(async (reason) => {
                console.log(reason);
                await this.logOut();
                return {account: {token: ''}} as any as LiminalMarket;
            });

            console.log('liminalMarket', liminalMarket);
        if (liminalMarket.account.token == '') return false;
        App.User.address = liminalMarket.account.address;
        App.User.alpacaId = liminalMarket.account.brokerId;
        App.User.chainId = liminalMarket.account.chainId;
        App.User.isLoggedIn = true;
        App.User.LiminalMarket = liminalMarket;

        return liminalMarket;
    }

    public async authenticateUser(enableWeb3Callback?: (walletConnectionInfo: any) => void,
                                  authenticatedCallback?: () => void
    ) {

        let connector = await AuthenticateService.enableWeb3();
        let liminalMarket = await this.isAuthenticated();
        console.log(liminalMarket);
        if (!liminalMarket) {
            await this.logOut();
            return;
        }

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


        App.User.setValidate(liminalMarket.account.token);
        App.User.token = liminalMarket.account.token;
        App.User.alpacaId = liminalMarket.account.brokerId;
        App.User.address = liminalMarket.account.address;
        App.User.isLoggedIn = true;
        if (authenticatedCallback) {
            authenticatedCallback();
        } else {
            location.reload();
        }
    }


}