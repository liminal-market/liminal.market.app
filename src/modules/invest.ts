
import Render from '../ui/Render';
import LiminalMarketService from "../services/blockchain/LiminalMarketService";
import SecuritiesList from "../ui/elements/SecuritiesList";
import {selectSymbol, tradePageInit} from "./trade";


export const loadInvest = async function() {
	let listOfSecurities = document.getElementById('list_of_securities');
	if (!listOfSecurities) return;

	let securitiesList = new SecuritiesList();
	let content = await securitiesList.render();
	listOfSecurities.innerHTML = content;
	await securitiesList.loadMore();

	await securitiesList.bindEvents(async (symbol, name, logo) => {
		let liminalMarketService = new LiminalMarketService(Moralis);
		let address = await liminalMarketService.getSymbolContractAddress(symbol);

		let render = new Render(Moralis);

		await render.render('trade', '', async function() {
			await tradePageInit();
			await selectSymbol(symbol, name, logo, address);
		});
	})
};


