export default class TradeInfo {
    price : number;
    lastTrade : Date;

    constructor(price : number, lastTrade : Date) {
        this.price = price;
        this.lastTrade = lastTrade;
    }
}