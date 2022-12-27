import NetworkInfo from "../../networks/NetworkInfo";
import Network from "../../networks/Network";
import User from "../../dto/User";
import UserService from "./UserService";
import Moralis from "moralis";
import network = Moralis.network;
import App from "../../main";
import StringHelper from "../../util/StringHelper";
import {isJSON} from "../../util/Helper";

export default class BaseService {

    constructor() {
    }

    public async get(path: string, data?: any, options?: any): Promise<any> {
        let url = '';
        let method = 'GET'
        if (!options || !options.relativeUrl) {
            url = App.Network.ServerUrl;
        }
        let params = new URLSearchParams(data);
        if (!params.has('chainId')) {
            params.set('chainId', App.Network.ChainId.toString());
        }
        if (!params.has('address')) {
            params.set('address', App.User.address);
        }

        let response = await fetch(this.getUrl(url, path) + '?' + params.toString(),
            {
                method: method,
                headers: {'Authentication': 'Bearer: ' + App.User.token, 'Content-Type': 'application/json'}
            })
        let obj = await response.json();
        return (obj.result) ? obj.result : undefined;
    }

    public async post<T>(path: string, data?: any) {
        if (!data) {
            data = {}
        }
        data.chainId = (data.chainId) ? data.chainId : App.Network.ChainId;
        data.address = (data.address) ? data.address : App.User.address;
        console.log(this.getUrl(App.Network.ServerUrl, path));

        let response = await fetch(this.getUrl(App.Network.ServerUrl, path),
            {
                method: 'POST',
                headers: {
                    'Authentication': 'Bearer: ' + App.User.token,
                    'Content-Type': 'application/json;charset=UTF-8'
                },
                body: JSON.stringify(data),
            })
        let obj = await response.json();
        if (obj.success) return obj.result;

        throw new Error(obj.error);

    }

    private getUrl(ServerUrl: string, path: string) {
        if (path.startsWith('/')) return ServerUrl + path;
        return ServerUrl + '/' + path;
    }
}