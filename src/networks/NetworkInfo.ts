import localhostNetwork from './localhost-network';
import mumbaiNetwork from './mumbai-network';
import Network from "./Network";
import CookieHelper from "../util/CookieHelper";
import Moralis from "moralis";
import polygonNetwork from "./polygon-network";
import {WalletType} from "../enums/WalletType";


const networkInfos = [localhostNetwork, mumbaiNetwork, polygonNetwork];


export default class NetworkInfo {
    private static instance: Network;
    moralis: typeof Moralis;

    private constructor(moralis: typeof Moralis) {
        this.moralis = moralis;
    }

    public static getInstance(): Network {
        if (NetworkInfo.instance) return NetworkInfo.instance;

        let cookieHelper = new CookieHelper(document);
        let walletType = cookieHelper.getCookieValue('wallet');
        if (!walletType && walletType != WalletType.MagicLink) {
            if (typeof ethereum != 'undefined' && ethereum && ethereum.chainId) {
                let networkInfo = this.getNetworkInfoByChainId(ethereum.chainId);
                if (networkInfo) {
                    NetworkInfo.instance = networkInfo;
                    return NetworkInfo.instance;
                }
            }
        }

        NetworkInfo.instance = this.getNetworkInfo();
        return NetworkInfo.instance;
    }

    public static loadNetwork(networkName: string): void {
        NetworkInfo.instance = this.getNetworkInfo(networkName);
    }

    public static setNetworkByChainId(chainId: number, walletType: WalletType): void {
        let network = this.getNetworkInfoByChainId(chainId);
        if (network) {
            NetworkInfo.instance = network;

            let cookieHelper = new CookieHelper(document);
            cookieHelper.setCookie('network', network.Name);
            cookieHelper.setCookie('wallet', walletType);
        }
    }

    public static getNetworks(): Array<Network> {
        let networks = new Array<Network>();
        let isLocalhost = window.location.host.indexOf('localhost') != -1;
        networkInfos.forEach(networkInfoType => {
            let tmp = new networkInfoType();
            if (!isLocalhost && tmp.Name == "localhost") return;

            networks.push(tmp);
        });
        return networks;
    }

    public static getNetworkInfoByChainId(chainId: number): Network | undefined {

        let networkInfo: Network | undefined;

        networkInfos.forEach(networkInfoType => {
            let tmp = new networkInfoType();
            if (tmp.ChainId == chainId) {
                networkInfo = tmp;
            }
        });
        return networkInfo;

    }

    private static getNetworkInfo(networkName?: string): Network {
        let cookieHelper = new CookieHelper(document);

        if (!networkName) networkName = cookieHelper.getCookieValue('network');
        if (!networkName) networkName = 'mumbai';

        let networkInfo = null;
        networkInfos.forEach(networkInfoType => {
            let tmp = new networkInfoType();
            if (tmp.Name == networkName) {
                networkInfo = tmp;
            }
        });
        if (networkInfo) return networkInfo;

        cookieHelper.setCookieNetwork('mumbai');
        console.error("Network '" + networkName + "' could not be found. Defaulting to Mumbai network.");

        return new mumbaiNetwork();
    }

}





