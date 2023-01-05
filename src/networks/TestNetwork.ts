import Network from "./Network";

export default class TestNetwork extends Network {

    constructor() {
        super();

        this.ServerUrl = "https://cloud-testnet.onrender.com";
        this.TestNetwork = true;
    }
}