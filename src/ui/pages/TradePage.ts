import TradePanel from "../elements/TradePanel";
import TradePageHtml from "../../html/pages/trade.html";
import ContractInfo from "../../contracts/ContractInfo";
import SecuritiesListModal from "../modals/SecuritiesListModal";

export default class TradePage {

	moralis : typeof Moralis;
	constructor(moralis : typeof Moralis) {
		this.moralis = moralis;
	}

	public async load(symbol?: string, name?: string, logo?: string, address?: string) {
		history.pushState(null, 'Buy stocks', '/trade');

		let mainContainer = document.getElementById('main_container');
		if (!mainContainer) return;

		let contractInfo = ContractInfo.getContractInfo();


		let template = Handlebars.compile(TradePageHtml);
		mainContainer.innerHTML = template({AUSDAddress:contractInfo.AUSD_ADDRESS});

		let tradePanel = new TradePanel(this.moralis);
		await tradePanel.render('liminal_market_trade_panel');

		if (symbol) {
			await this.selectSymbol(symbol, name!, logo!, address!)
		}

		let findSymbol = document.getElementById('findSymbol');
		if (!findSymbol) return;

		findSymbol.addEventListener('click', (evt) => {
			evt.preventDefault();

			let securitiesModal = new SecuritiesListModal();
			securitiesModal.showModal(() => {
				securitiesModal.hideModal();
			})
		})
	};

	public async selectSymbol(symbol: string, name: string, logo: string, address: string) {
		let tradePanel = new TradePanel(this.moralis);
		await tradePanel.render('liminal_market_trade_panel', symbol, name, logo, address);
	}

}


