import TradePanel from "../ui/elements/TradePanel";

let tradePanel = new TradePanel(Moralis);

export const tradePageInit = async function () {
	history.pushState(null, 'Buy securities', '/trade');

	await tradePanel.render('liminal_market_trade_panel');
};

export const selectSymbol = async function(symbol : string, name : string, logo : string, address : string) {
	await tradePanel.render('liminal_market_trade_panel', symbol, name, logo, address);
}



const showUseWalletForOrders = function() {
	document.getElementById('create-order')!.classList.add('sidebar');
	document.getElementById('use_wallet_for_orders')!.style.display = 'inline-block';
	document.getElementById('buy_securities_wrapper')!.style.display='inline-block';
}



