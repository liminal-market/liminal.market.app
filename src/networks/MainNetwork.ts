import Network from "./Network";

export default class MainNetwork extends Network {

    constructor() {
        super();

        this.ServerUrl = "https://cloud-mainnet.onrender.com";
        this.TestNetwork = false;
    }
}