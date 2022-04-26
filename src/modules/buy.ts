import {AddressZero, addTokenToWallet, roundNumber} from '../util/Helper';

import {IsMarketOpen, isMarketOpen, UserIsOffHours} from './market';
import {loadSecurities} from './securities';
import BigNumber from 'bignumber';
import LiminalMarketService from "../services/blockchain/LiminalMarketService";
import ExecuteTradeButton from "../ui/elements/ExecuteTradeButton";
import SecuritiesList from "../ui/modals/SecuritiesList";
import StockPriceService from "../services/backend/StockPriceService";
import Progress from "../ui/elements/Progress";
import Subscription from "../services/backend/Subscription";


export const ExecuteTradeOffHoursTxt = 'Execute trade <div class="small_print">It will take few hours to process, market is closed<br>You can enable "Off hours trading" in the Menu</div>';
let SelectedSymbolAddress = null;
let Symbol = '';

let liminalMarketService : LiminalMarketService;

export const buyPageInit = async function () {
	history.pushState(null, 'Buy securities', '/buy');

	document.getElementById('buy_amount')!.addEventListener('click', function() {
		updateBuyInfo(Symbol);
	});

	liminalMarketService = new LiminalMarketService(Moralis);

	await setupSecurities();
	await setupBuyButton();
	showUseWalletForOrders();
};

export const selectSymbol = async function(symbol, name, logo, address) {
	await buyPageInit();

	await setSelectedSymbolAndAddress(symbol, address);

	let selectSymbolBtn = document.getElementById('select-symbol');
	selectSymbolBtn.innerHTML = name + ' (' + symbol + ')';

	await updateBuyInfo(symbol, name, logo);
}


const setupBuyButton = async function () {
	let executeTradeButton = new ExecuteTradeButton(Moralis, 'aUSD', 0, TradeType.aUSD);
	await executeTradeButton.renderButton();

}


const showUseWalletForOrders = function() {
	document.getElementById('create-order').classList.add('sidebar');
	document.getElementById('use_wallet_for_orders').style.display = 'inline-block';
	document.getElementById('buy_securities_wrapper').style.display='inline-block';
}


const setupSecurities = async function () {
	document.getElementById('select-symbol').addEventListener('click', async function(evt) {
		await loadSecuritiesModal(evt);
	});
	document.getElementById('buy_amount').onchange = async function() {
		await updateBuyInfo(Symbol);
	}

	document.getElementById('findSymbol').addEventListener('click', async function(evt) {
		await loadSecuritiesModal(evt);
	});
};

const loadSecuritiesModal = async function(evt : MouseEvent) {
	evt.preventDefault();

	let securities = new SecuritiesList();
	await securities.showModal();

};



const getSymbolPrice = async function (evt? : Event) {
	if (evt) {
		evt.preventDefault();
	}


	offHoursInfo().then();
	SelectedSymbolAddress = await getSymbolContractAddress(Symbol);
	console.log('contractAddress:', SelectedSymbolAddress);
	if (SelectedSymbolAddress == AddressZero) {
		document.getElementById('execute-trade').innerHTML = "Create token & execute trade";
		//TODO for sandbox lets not show this, but for live we need to show.
		//document.getElementById('add-token-info').style.display='block';
		//document.getElementById('add-token-info').innerHTML = "<div >We will need to create the token when you buy it. Since you are the first one to buy this symbol, this will incurs extra cost. It's a low cost</div>";
	} else {
		document.getElementById('execute-trade').innerHTML = "Execute trade";
		addTokenLink(Symbol, SelectedSymbolAddress);
	}

	await loadAssetPrice();
	await updateBuyInfo(Symbol);
}

const loadAssetPrice = async function(symbol : string) {

	let stockPriceService = new StockPriceService(Moralis);
	let tradeInfo = stockPriceService.getSymbolPrice(symbol);
}



const addTokenLink = function(symbol, contractAddress) {
	document.getElementById('add-token-info').style.display='none';
};

export const addTokenLinkBottom = async function(symbol, contractAddress) {
	const asset = await getAssetBySymbol(symbol);

	document.getElementById('addNewTokenToWallet').style.display = 'block';
	(document.getElementById('tokenLogo') as HTMLImageElement).src = '/img/logos/' + asset.Logo;
	document.getElementById('addNewTokenText').innerHTML = 'Add ' + symbol + ' to your wallet.';
	document.getElementById('addNewToken').onclick = async function (evt) {
		evt.preventDefault();
		await addTokenToWallet(contractAddress, symbol);
	};

};

export const updateBuyInfo = async function (symbol : string, name? : string, logo? : string) {
	if (!symbol) return;
	let buyAmount = (document.getElementById('buy_amount') as HTMLInputElement).value;
	if (buyAmount === '' || assetPrice == null) return;

	document.getElementById('buy_success_message').style.display = 'none';
	let str = 'Estimated you will buy ' + roundNumber(parseFloat(buyAmount) / assetPrice) + ' shares at the price of $' + assetPrice + ' per share. ';
	str += 'Last trade was ' + (new Date(lastTraded)).toLocaleString();
	if (SelectedSymbolAddress == AddressZero) {
		str += '<br /><span class="small_print">Since you are the first one to buy ' + symbol + " you will be asked to create the token first, then we'll execute the trade</span>";
	}

	document.getElementById('buy-info').innerHTML = str;
	document.getElementById('buy-info').style.display = 'block';
	await checkTokenValueVsBuyAmount();
};



const showProgressStep = function (text : string, percentage : number, warning? : boolean) {
	let progress = new Progress();
	progress.show(text, percentage, warning);
};

const hideProcessStep = function() {
	document.getElementById('buy_progress').style.display = "none";

};

const transfer = async function () {
	const buyAmount = (document.getElementById('buy_amount') as HTMLInputElement).value;
	if (Symbol === '' || buyAmount === '') return;

	hideExecuteTradeButton();

	if(SelectedSymbolAddress == null) {
		SelectedSymbolAddress = await getSymbolContractAddress(Symbol);
	}

	let checkMetamaskTimeout = null;
	if (SelectedSymbolAddress == AddressZero) {

		showProgressStep('First we need to create token, you need to confirm', 99);
		checkMetamaskTimeout = setTimeout(function () { checkToShowMetamaskIcon('First we need') }, (10 * 1000));

		let txResult = await executeCreateToken(Symbol).catch(function() {
			hideProcessStep();
			return null;
		});
		clearTimeout(checkMetamaskTimeout);

		if(txResult == null) return;

		console.log(txResult);
		if (txResult.events.TokenCreated) {
			SelectedSymbolAddress = txResult.events.TokenCreated.returnValues.tokenAddress;
		}
	}

	console.log('recipient', SelectedSymbolAddress);
	if (SelectedSymbolAddress == AddressZero) return;
	document.getElementById('execute-trade').innerHTML = "Execute trade";
	let waitingStr = 'Waiting on approval to execute to buy ';
	showProgressStep(waitingStr + Symbol + ' for $' + buyAmount + '.', 99);
	checkMetamaskTimeout = setTimeout(function () { checkToShowMetamaskIcon(waitingStr) }, 10 * 1000);


	await subscribeToTable();

	let buyResult = await executeBuy(SelectedSymbolAddress, parseFloat(buyAmount));
	if (buyResult == null) {
		hideProcessStep();
		return;
	}

	let ethLink = ' <a class="white-link" target="_blank" href="https://mumbai.polygonscan.com/tx/' + buyResult.hash + '">View transaction</a>';
	showProgressStep('Blockchain is confirming trade.' + ethLink, 56)
	clearTimeout(checkMetamaskTimeout);

	console.log('buyResult', buyResult);


	document.getElementById('add-token-info').style.display = 'none';


};
const subscribeToTable = async function() {
	let subscription = new Subscription(Moralis);
	subscription.subscribeToTable();
};


const getOrderBuyTablePrefix = function() {
	if (Main.NetworkInfo.ChainId == 43113) return "Fuji";
	return "";
};

const checkToShowMetamaskIcon = function(txt : string) {
	//Waiting on approval to execute
	if (document.getElementById('buy_progress').style.display != "none" && document.getElementById('buying_steps').innerText.indexOf(txt) != -1) {
		showProgressStep('Hey Ho! Is Metamask be waiting for you?<br />Check top right corner of your browser <img src="/img/metamask-pending.png" alt="Pending transaction"/>', 99, true);
	}

	setTimeout(function () { blockchainSlowMessage(); }, 8 * 1000)
}

const blockchainSlowMessage = function() {

	if (document.getElementById('buy_progress').style.display != "none" && document.getElementById('buying_steps').innerText.indexOf('Hey Ho!') != -1) {
		showProgressStep('If you have already approved, maybe blockchain is slow. Let us give it a bit. Just double check for <img src="/img/metamask-pending.png" alt="Pending transaction"/>', 99, true);
	}
};


export const setSelectedSymbolAndAddress = async function(symbol : string, address : string) {
	SelectedSymbolAddress = address;
	Symbol = symbol;

	await getSymbolPrice();
};