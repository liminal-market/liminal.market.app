export default class TradeInfo {
    price : number;
    lastTrade : Date;

    constructor(price, lastTrade) {
        this.price = price;
        this.lastTrade = lastTrade;
    }
}