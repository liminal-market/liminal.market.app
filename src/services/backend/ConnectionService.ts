import NetworkInfo from "../../networks/NetworkInfo";

export default class ConnectionService {
    options : {serverUrl:string, appId:string};

    constructor() {
        this.options = {serverUrl: '', appId: ''};
    }


    public getOptions() {
        return this.options;
    }

    public async start(): Promise<void> {
        let networkInfo = NetworkInfo.getInstance();
        this.options = {serverUrl: networkInfo.ServerUrl, appId: networkInfo.AppId};

    }
}