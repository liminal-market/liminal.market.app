import Network from "./Network";

export default class MainNetwork extends Network {

    constructor() {
        super();

        this.ServerUrl = "https://mainnet.liminal.market";
        this.TestNetwork = false;
    }
}