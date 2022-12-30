import Network from "./Network";

export default class TestNetwork extends Network {

    constructor() {
        super();

        if (window.location.host.indexOf('localhost') == -1) {
            this.ServerUrl = "https://cloud-testnet.onrender.com";
        } else {
            this.ServerUrl = "http://localhost:10000";
        }
        this.ServerUrl = "https://cloud-testnet.onrender.com";
        this.TestNetwork = true;
    }
}