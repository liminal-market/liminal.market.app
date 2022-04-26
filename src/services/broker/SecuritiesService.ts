import TradeInfo from "../backend/TradeInfo";

export default class SecuritiesService {

    securities = new Map<string, any>();
    securitiesArray : any;
    private static instance : SecuritiesService;
    page : number;
    symbols = ["MSFT", "AAPL", "AMZN", "TSLA", "GOOGL", "GOOG", "GME", "FB", "NVDA", "BRK.B", "JPM", "HD", "JNJ", "UNH", "PG", "BAC", "V", "ADBE", "NFLX", "CRM", "PFE", "DIS", "MA", "XOM", "TMO", "COST"]

    private constructor() {
        this.securities = new Map<string, any>();
        this.page = 1;
    }

    public static async getInstance(): Promise<SecuritiesService> {
        if (!SecuritiesService.instance) {
            SecuritiesService.instance = new SecuritiesService();
            SecuritiesService.instance.securities = await SecuritiesService.instance.getSecurities();
        }
        return SecuritiesService.instance;
    }

    public async getSecurities() {
        if (this.securities.size != 0) return this.securities;

        const response = await fetch('/securities/securities.json');
        const results = await response.json();
        for (let i=0;i<results.length;i++) {
            this.securities.set(results[i].Symbol, results[i]);
        }
        this.securitiesArray = Array.from(this.securities);
        return this.securities;
    }

    public async getSecurityBySymbol(symbol : string) : Promise<any> {
        let securities = await SecuritiesService.instance.getSecurities();
        return securities.get(symbol);
    }

    public async getTopSecurities() {
        let securities = await this.getSecurities();
        let topSecurities = new Map<string, any>();

        for (const symbol of this.symbols) {
            let security = securities.get(symbol);
            topSecurities.set(symbol, security);
        }
        return topSecurities;
    }

    public async getPaginatingSecurities(page : number) {
        if (page == 0) return this.getTopSecurities();

        let securitiesOnPage = new Map<string, any>();
        let i = page * this.symbols.length;
        let pageCount = i + 10;
        for (;i<pageCount && i<this.securitiesArray.length;i++) {
            securitiesOnPage.set(this.securitiesArray[i].symbol, this.securitiesArray[i]);
        }
        return securitiesOnPage;
    }


}