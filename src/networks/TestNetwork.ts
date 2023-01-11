import Network from "./Network";

export default class TestNetwork extends Network {

    constructor() {
        super();

        this.ServerUrl = "https://testnet.liminal.market";
        this.TestNetwork = true;
    }
}