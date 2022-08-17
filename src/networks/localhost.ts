import Network from "./Network";

export default class localhost extends Network {

    constructor() {
        super();
        this.chainId = "31337";
        this.name = "localhost";
        this.liminalMarketAddress = "0x28f44D2e4254cB80603Aed7e98AcDCE6F52A4387";
        this.kycAddress = "0x5407C97F6991E52206e039C0353141db5239cd1d";
        this.aUsdAddress = "0x9aD101eabDc5dEc6AF911Bc131694D0AC62b742a";
        this.calendarAddress = "0xA9fAB3a875B346E69689489d67d51C9aa05910E6";
    }
}