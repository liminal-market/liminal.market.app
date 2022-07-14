import Network from "./Network";

export default class localhost extends Network {

    constructor() {
        super();
        this.chainId = "31337";
        this.name = "localhost";
        this.liminalMarketAddress = "0x28f44D2e4254cB80603Aed7e98AcDCE6F52A4387";
    }
}