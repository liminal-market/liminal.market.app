import SecuritiesService from "../../services/broker/SecuritiesService";
import Modal from "./Modal";

export default class SecuritiesList {
    page : number;
    constructor() {
        this.page = 0;
    }
    public async showModal() {
        let securitiesService = await SecuritiesService.getInstance();
        let securities = await securitiesService.getPaginatingSecurities(this.page++);

        let table = '<table id="securities_table" class="table table-hover mt-2">';
        let head = '<thead><tr><th colspan="3">Name</th><th colspan="3">Symbol</th></tr></thead>';
        let tbody = '<tbody id="securities_list">'
        for (let security in securities) {
            tbody += this.createTrForSecurity(security);
        }
        tbody += '</tbody></table>'

        let modal = new Modal();
        modal.showModal(table + head + tbody, null, this.loadMore);

    }

    public async loadMore() : Promise<void> {
        let tbody = document.getElementById('securities_list');
        if (!tbody) return;

        let securitiesService = await SecuritiesService.getInstance();
        let securities = await securitiesService.getPaginatingSecurities(this.page++);
        let content = '';
        for (let security in securities) {
            content += this.createTrForSecurity(security);
        }
        tbody.appendChild(document.createTextNode(content));
    }

    public createTrForSecurity(security : any) : string {
        let str = '';
        str += '<tr><td><img src="/img/logos/' + security.Logo + '" class="symbol_logo" alt="Symbol logo"/></td>';
        str += '<td class="asset_name">' + security.Name + '</td>';
        str += '<td><button class="w-200 btn btn-success btn-sm select_security" data-name="' + security.Name + '" data-logo="' + security.Logo + '" data-symbol="' + security.Symbol + '">Select</button>';
        str += '<td><a href="https://strike.market/stocks/' + security.Symbol + '" target="_blank">' + security.Symbol + '</a></td>';
        str += '<td><a href="" class="getAddress" data-symbol="' + security.Symbol + '">Get address</a></td>';
        str += '<td><a href="" class="addToWallet" data-symbol="' + security.Symbol + '">Add to wallet</a></td></tr>';
        return str;
    }

}