import Security from "./Security";

export default class SecuritiesService {

    securities = new Map<string, Security>();
    securitiesArray : any;
    private static instance : SecuritiesService;
    page: number;
    symbols = ["MSFT", "AAPL", "AMZN", "TSLA", "GOOGL", "GOOG", "GME", "META", "NVDA", "BRK.B", "JPM", "HD", "JNJ", "UNH", "PG", "BAC", "V", "ADBE", "NFLX", "CRM", "PFE", "DIS", "MA", "XOM", "TMO", "COST"]

    private constructor() {
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
        console.log('getSecurities');
        let mark1 = 'start';
        let mark2 = 'fetch';
        let mark3 = 'loop';
        let mark4 = 'toArray';
        performance.mark(mark1);
        if (this.securities.size != 0) return this.securities;

        const response = await fetch('/securities/securities.json');

        const results = await response.json();
        performance.mark(mark2);
        for (let i = 0; i < results.length; i++) {
            this.securities.set(results[i].Symbol, Object.assign(new Security, results[i]));
        }
        performance.mark(mark3);
        this.securitiesArray = Array.from(this.securities);
        performance.mark(mark4);


        performance.measure("measure start to fetch", mark1, mark2);
        performance.measure("measure fetch to loop", mark2, mark3);
        performance.measure("measure loop to array", mark3, mark4);
        console.log(performance.getEntriesByType("measure"));
        performance.clearMarks();
        performance.clearMeasures();
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