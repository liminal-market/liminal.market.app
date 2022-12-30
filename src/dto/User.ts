import ProviderInfo from "../wallet/ProviderInfo";
import CookieHelper from "../util/CookieHelper";

export default class User {
    provider: any;
    chainId: number;
    ether: any;
    email: string;
    providerInfo: any;
    alpacaId?: string;
    address: string;
    magic: any;
    connector: any;
    _token: string = '';
    isLoggedIn: boolean = false;
    signer: any;

    constructor(provider: any, address: string, chainId: number, ether: any) {
        this.provider = provider;
        this.address = address;
        this.chainId = chainId;
        this.ether = ether;
        this.providerInfo = new ProviderInfo(provider);
        this.email = '';

        let cookieHelper = new CookieHelper();
        this._token = cookieHelper.getCookieValue('token');
    }

    public get token() {
        return this._token;
    }

    public set token(value: string) {
        this._token = value;
    }

    setValidate(validate: any) {
        let base64 = btoa(JSON.stringify(validate))
        let cookieHelper = new CookieHelper();
        cookieHelper.setCookie('validate', base64);
    }

}