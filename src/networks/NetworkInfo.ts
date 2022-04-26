import localhostNetwork from './localhost-network';
import rinkebyNetwork from './rinkeby-network';
import mumbaiNetwork from './mumbai-network';
import fujiNetwork from './fuji-network';
import Network from "./Network";
import CookieHelper from "../util/CookieHelper";
import {Main} from "../main";
import {AddressZero} from "../util/Helper";


const networkInfos = [localhostNetwork, rinkebyNetwork, mumbaiNetwork, fujiNetwork];


export default class NetworkInfo {
    private static instance: Network;
    moralis : typeof Moralis;
    private constructor(moralis : typeof Moralis) {
        this.moralis = moralis;
    }

    public static getInstance(): Network {
        if (!NetworkInfo.instance) {
            NetworkInfo.instance = this.getNetworkInfo();
        }
        return NetworkInfo.instance;
    }

    public static loadNetwork(networkName : string) : void {
        NetworkInfo.instance = this.getNetworkInfo(networkName);
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





