import NetworkInfo from "../../networks/NetworkInfo";

export default class ConnectionService {
    moralis : typeof Moralis;
    options : {serverUrl:string, appId:string};

    constructor(moralis? : typeof Moralis) {
        if(!moralis) moralis = Moralis;

        this.moralis = moralis;
        this.options = {serverUrl:'', appId:''};
    }


    public getOptions() {
        return this.options;
    }

    public async start() {
        let networkInfo = NetworkInfo.getInstance();
        this.options = {serverUrl:networkInfo.ServerUrl, appId:networkInfo.AppId};

        await this.moralis.start(this.options).catch(function (err) {
            if (err.message.indexOf('Invalid session token') != -1) {
                Moralis.User.logOut();
            }
            ;
        });
    }
}