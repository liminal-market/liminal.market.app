import Network from "./Network";

export default class MainNetwork extends Network {

    constructor() {
        super();
        if (window.location.host.indexOf('localhost') != -1) {
            this.ServerUrl = "http://localhost:10000";
            this.AppId = "";
        } else {
            this.ServerUrl = "https://rokinwgcthqy.grandmoralis.com:2053/server";
            this.AppId = "FqJxfp9xng1SbovOToR2fnFjnBJju2Ko67nmTfFF";
        }
        //this.ServerUrl = "https://cloud-testnet.onrender.com";
        this.TestNetwork = false;
    }
}