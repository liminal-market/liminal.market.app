import LiminalMarketService from "../../services/blockchain/LiminalMarketService";
import SecuritiesList from "../../ui/elements/SecuritiesList";
import TradePage from "../pages/TradePage";
import StocksPageHtml from '../../html/pages/stockspage.html';

export default class StocksPage {
	moralis : typeof Moralis;
	constructor(moralis : typeof Moralis) {
		this.moralis = moralis;
	}

	public async load() {
		let mainContainer = document.getElementById('main_container');
		if (!mainContainer) return;

		let securitiesList = new SecuritiesList();
		let securities = await securitiesList.render();

		let template = Handlebars.compile(StocksPageHtml);
		mainContainer.innerHTML = template({securities:securities});

		await securitiesList.loadMore();

		await securitiesList.bindEvents(async (symbol, name, logo) => {
			let liminalMarketService = new LiminalMarketService(this.moralis);
			let address = await liminalMarketService.getSymbolContractAddress(symbol);

			let tradePage = new TradePage(this.moralis);
			window.scrollTo(0, 0);
			history.pushState(null, 'Buy stocks', '#/trade');
			await tradePage.load(symbol, name, logo, address);
		})
	};

}
