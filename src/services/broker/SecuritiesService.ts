import Security from "./Security";
import BaseService from "../backend/BaseService";

export default class SecuritiesService extends BaseService {

    securities = new Map<string, Security>();
    securitiesArray: any;
    private static instance: SecuritiesService;
    page: number;
    symbols = ["MSFT", "AAPL", "AMZN", "TSLA", "GOOGL", "GOOG", "GME", "META", "NVDA", "BRK.B", "JPM", "HD", "JNJ", "UNH", "PG", "BAC", "V", "ADBE", "NFLX", "CRM", "PFE", "DIS", "MA", "XOM", "TMO", "COST"]

    private constructor() {
        super();

        this.securities = new Map<string, Security>();
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

        const results = await this.get('/securities/securities.json', {}, {relativeUrl: true});

        for (let i = 0; i < results.length; i++) {
            this.securities.set(results[i].Symbol, Object.assign(new Security, results[i]));
        }
        this.securitiesArray = Array.from(this.securities);

        return this.securities;
    }

    public async getSecurityBySymbol(symbol : string) : Promise<Security> {
        let securities = await this.getSecurities();

        let security = securities.get(symbol);
        return (security) ? security : new Security();
    }

    public async getTopSecurities() {
        let securities = await this.getSecurities();
        let topSecurities = new Array<Security>();

        for (const symbol of this.symbols) {
            let security = securities.get(symbol);
            if (security) {
                topSecurities.push(security);
            }
        }
        return topSecurities;
    }

    public async getPaginatingSecurities(page : number) {
        if (page == 0) return this.getTopSecurities();

        let securitiesOnPage = new Array<Security>();
        let i = page * this.symbols.length;
        let pageCount = i + 10;
        for (;i<pageCount && i<this.securitiesArray.length;i++) {
            securitiesOnPage.push(this.securitiesArray[i][1]);
        }
        return securitiesOnPage;
    }


    public async find(search: string) : Promise<Array<Security>> {
        let results = new Array<Security>();
        search = search.toLocaleLowerCase();

        this.securities.forEach(function (security) {
            if (security.Symbol.toLowerCase().indexOf(search) != -1 ||
                security.Name.toLowerCase().indexOf(search) != -1) {
                results.push(security);
            }
        });
        return results;
    }
}