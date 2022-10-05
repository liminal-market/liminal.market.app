import Network from "./Network";

export default class localhost extends Network {

    constructor() {
        super();
        this.chainId = "31337";
        this.name = "localhost";
        this.liminalMarketAddress = "0xbd1270f3f8175927Fe427a220b9253b360Be52Bd";
        this.kycAddress = "0x2856a0C8034bF887928845D05179847e0ADC2209";
        this.aUsdAddress = "0x6aCE712D412e99727aDf2272BE24f8e45aF76270";
        this.calendarAddress = "0x459239D96976440d68fd78e1401983376840d563";
    }
}