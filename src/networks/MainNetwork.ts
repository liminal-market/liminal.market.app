import Network from "./Network";

export default class MainNetwork extends Network {

    constructor() {
        super();
        if (window.location.host.indexOf('localhost') != -1) {
            this.ServerUrl = "http://localhost:10000";
            this.AppId = "";
        } else {
            this.ServerUrl = "https://cloud-mainnet.onrender.com";
            this.AppId = "";
        }
        this.ServerUrl = "https://cloud-mainnet.onrender.com";
        this.TestNetwork = false;
    }
}