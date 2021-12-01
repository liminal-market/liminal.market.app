import {
	AUSD_ADDRESS,
	LIMINAL_ADDRESS,
	SECURITY_FACTORY_ADDRESS
} from './contract-addresses.js';
import LiminalExchangeInfo from "../abi/LiminalExchange.json" assert {	type: "json"};
import SecurityFactoryInfo from "../abi/SecurityFactory.json" assert {	type: "json"};
import SecurityTokenInfo from "../abi/SecurityToken.json" assert {	type: "json"};
import AUSDInfo from "../abi/aUSD.json"assert {	type: "json"};

import {
	USDC_ABI,
	USDC_ADDRESS,
	USDC_DECIMAL
} from './constants.js'
import {
	addTokenToWallet,
	roundNumber,getAssets
} from './helper.js';
import {
	IsValidKYC,
	initKYC
} from './kyc.js';
import {
	render
} from './render.js';
import {
	login
} from './account.js';


export const buyPageInit = function () {
	document.getElementById('buy_amount').onchange = updateBuyInfo
	document.getElementById('buy_using').onchange = updateBuyInfo
	setupAssets();
	loadBuyTokens();
}

const setupBuyButton = function () {
	console.log(IsValidKYC);
	document.getElementById('execute-trade').classList.remove('disabled')
	document.getElementById('execute-trade').classList.add('enabled');
	if (IsValidKYC) {
		document.getElementById('execute-trade').onclick = transfer;
	} else {
		const user = Moralis.User.current();
		if (!user) {
			document.getElementById('execute-trade').innerText = "Login using Metamask";
			document.getElementById('execute-trade').onclick = function () {
				login(setupBuyButton);
			}
		} else {
			document.getElementById('execute-trade').innerText = 'You need to do (fake) KYC before buying';
			document.getElementById('execute-trade').onclick = function () {
				render('kyc', null, initKYC);
			}
		}
	}
}

const loadBuyTokens = async function () {
	const user = await Moralis.User.current();
	if (!user) return;

	const ethAddress = await user.get('ethAddress');

	const usdcOptions = {
		contractAddress: USDC_ADDRESS,
		functionName: "balanceOf",
		abi: USDC_ABI,
		params: {
			account: ethAddress
		}
	};
	Moralis.executeFunction(usdcOptions).then((balanceOf) => {
		addUSDTokenValue('USDC', Moralis.Units.FromWei(balanceOf, USDC_DECIMAL));
		console.log('USDC balance:', Moralis.Units.FromWei(balanceOf, USDC_DECIMAL));
	}, function (error) {
		console.log('error', JSON.stringify(error));
	});

	const ausdcOptions = {
		contractAddress: AUSD_ADDRESS,
		functionName: "balanceOf",
		abi: SecurityTokenInfo.abi,
		params: {
			account: ethAddress
		}
	};
	Moralis.executeFunction(ausdcOptions).then((balanceOf) => {
		addUSDTokenValue('aUSD', Moralis.Units.FromWei(balanceOf, 18));
		console.log('aUSDC balance:', Moralis.Units.FromWei(balanceOf, 18));
	});
}

let usdTokenValues = new Map();
const addUSDTokenValue = async function (token, balanceOf) {
	usdTokenValues.set(token, balanceOf);
	if (usdTokenValues.size == 2) {
		var options = document.getElementById('buy_using').options;
		options[0].dataset.max = usdTokenValues.get("USDC");
		options[1].dataset.max = usdTokenValues.get("aUSD");

		options[0].text = 'USDC - $' + usdTokenValues.get("USDC");
		options[1].text = 'aUSD - $' + usdTokenValues.get("aUSD");
	}
}


const setupAssets = async function () {
	document.getElementById('symbols').onchange = getSymbolPrice;
	document.getElementById('buy_amount').onchange = updateBuyInfo;

	const assets = await getAssets();

	let str = '';
	for (var i = 0; i < assets.length; i++) {
		str += '<option value="' + assets[i].Symbol + '">' + assets[i].Symbol + ' - ' + assets[i].Name + '</option>';
	}
	$('#symbols').append(str);


}

let assetPrice = null;
let lastTraded = null;

const getSymbolPrice = async function (evt) {
	evt.preventDefault();

	let options = document.getElementById('symbols').options;
	let symbol = options[options.selectedIndex].value;

	if (symbol === '') {
		assetPrice = 0;
		lastTraded = '';
		return;
	}

	const securityTokenOptions = {
		contractAddress: SECURITY_FACTORY_ADDRESS,
		functionName: "getSecurityToken",
		abi: SecurityFactoryInfo.abi,
		params: {
			symbol: symbol
		}
	};
	Moralis.executeFunction(securityTokenOptions).then((contractAddress) => {
		if (contractAddress == "0x0000000000000000000000000000000000000000") {
			document.getElementById('addWalletSpan').innerHTML = '';
			document.getElementById('add-token-info').style.display='block';
			document.getElementById('add-token-info').innerHTML = '<div >We will need to create the token when you buy it. Since you are the first one to buy this symbol, this will incure extra cost.</div>';
		} else {
			addTokenLink(symbol, contractAddress);
		}

	});

	const params = {
		symbol: symbol
	};
	Moralis.Cloud.run("getSymbolPrice", params).then(function (jsonResult) {

		assetPrice = jsonResult.trade.p;
		lastTraded = jsonResult.trade.t;

		updateBuyInfo();
	}).catch(function (result) {
		console.log('catch:' + result);
	});
}

const addTokenLink = function(symbol, contractAddress) {

	let str = '<a href="#" id="addTokenToWallet">Add ' + symbol + ' symbol to wallet</a> - <a href="#" id="copyAddress">Copy addr</a>';
	document.getElementById('addWalletSpan').innerHTML = str;
	document.getElementById('addTokenToWallet').onclick = async function (evt) {
		evt.preventDefault();
		await addTokenToWallet(contractAddress, symbol);
	}
	document.getElementById('copyAddress').onclick = async function (evt) {
		evt.preventDefault();
		navigator.clipboard.writeText(contractAddress);
	}
	document.getElementById('add-token-info').style.display='none';
}


const updateBuyInfo = async function () {

	let buyAmount = document.getElementById('buy_amount').value;
	if (buyAmount === '' || assetPrice == null) return;

	document.getElementById('buy_success_message').style.display = 'none';
	let str = 'Estimated you will buy ' + roundNumber(buyAmount / assetPrice) + ' shares at the price of $' + assetPrice + ' per share. ';
	str += 'Last trade was ' + (new Date(lastTraded)).toLocaleString();
	document.getElementById('buy-info').innerHTML = str;
	document.getElementById('buy-info').style.display = 'block';
	checkTokenValueVsBuyAmount();
}

const checkTokenValueVsBuyAmount = async function () {
	document.getElementById('buy_danger_message').style.display = 'none';
	let buyAmount = document.getElementById('buy_amount').value;
	const buy_using = document.getElementById('buy_using').value;
	const userTokenValue = usdTokenValues.get(buy_using);

	var user = Moralis.User.current();
	if (!user) {
		document.getElementById('buy_danger_message').style.display = 'block';
		let str = 'You are not logged in. Login in the menu at top.'
		document.getElementById('buy_danger_message').innerHTML = str;
		return;
	}

	document.getElementById('execute-trade').classList.add('disabled')
	document.getElementById('execute-trade').classList.remove('enabled');
	if (!userTokenValue) {
		document.getElementById('buy_danger_message').style.display = 'block';
		//loadBuyTokens
		let str = "You don't have any " + buy_using + ' tokens in your wallet. aUSD is only available after you have sold shares. Select USDC to get instruction on how to get it.'
		if (buy_using === 'USDC') {
			str = "You don't have any " + buy_using + ' tokens in your wallet. <a href="https://app.uniswap.org/" target="_blank">Go to Uniswap to get some</a>.';
			str += '<br />When you have some <a href="#" id="reloadBuyTokens">USDC click me so I can see it.</a>';
			document.getElementById('buy_danger_message').innerHTML = str;
			document.getElementById('reloadBuyTokens').addEventListener('click', function (evt) {
				evt.preventDefault();
				loadBuyTokens();
			});
		} else {
			document.getElementById('buy_danger_message').innerHTML = str;
		}

		return false;
	}
	if (userTokenValue < buyAmount) {
		document.getElementById('buy_danger_message').style.display = 'block';
		document.getElementById('buy_danger_message').innerHTML = "You don't have enough " + buy_using + " tokens in your wallet."
		return false;
	}
	await setupBuyButton();

}

const showProgressStep = async function (text, perc) {
	document.getElementById('buy_progress').style.display = "block";
	var element = document.getElementById('buying_steps');
	element.innerHTML = '<div class="progress_text">' + text + '</div>';
	element.style.width = perc + '%';

	element.classList.toggle('progress-bar-striped', (perc != 100));
	element.classList.toggle('progress-bar-animated', (perc != 100));

}

const hideProcessStep = function() {
	document.getElementById('buy_progress').style.display = "none";
}

const getApproveTokenResult = async function (buyUsing, buyAmount) {
	try {
		let ethAddress = Moralis.User.current().get('ethAddress');
		if (buyUsing === 'USDC') {

			console.log('buyamount:', Moralis.Units.Token(buyAmount, USDC_DECIMAL), Moralis.Units.Token(buyAmount, USDC_DECIMAL).toString());
			let usdcOptions = {
				contractAddress: USDC_ADDRESS,
				functionName: "allowance",
				abi: USDC_ABI,
				params: {
					owner: ethAddress,
					spender: LIMINAL_ADDRESS
				},
			};
			let allowance = await Moralis.executeFunction(usdcOptions);
			console.log('allowance:', Moralis.Units.Token(allowance, USDC_DECIMAL).toString(), Moralis.Units.Token(buyAmount, USDC_DECIMAL).toString());
			if (parseFloat(Moralis.Units.Token(buyAmount, USDC_DECIMAL).toString()) <= allowance) {
				return parseFloat(Moralis.Units.Token(allowance, USDC_DECIMAL).toString());
			}

			usdcOptions = {
				contractAddress: USDC_ADDRESS,
				functionName: "approve",
				abi: USDC_ABI,
				params: {
					_spender: LIMINAL_ADDRESS,
					_value: Moralis.Units.Token(buyAmount, USDC_DECIMAL)
				},
			};
			return await Moralis.executeFunction(usdcOptions);

		} else {
			let aUsdOptions = {
				contractAddress: AUSD_ADDRESS,
				functionName: "allowance",
				abi: AUSDInfo.abi,
				params: {
					owner: ethAddress,
					spender: LIMINAL_ADDRESS
				},
			};
			let allowance = await Moralis.executeFunction(aUsdOptions);
			console.log('allowance:', allowance);
			if (Moralis.Units.Token(buyAmount, 18) <= allowance) {
				return allowance;
			}

			aUsdOptions = {
				contractAddress: AUSD_ADDRESS,
				functionName: "approve",
				abi: AUSDInfo.abi,
				params: {
					_spender: LIMINAL_ADDRESS,
					_value: Moralis.Units.Token(buyAmount, 18)
				},
			};
			return await Moralis.executeFunction(usdcOptions);
		}
	} catch (ex) {
		console.log('error', ex);
		return null;
	}
}

const transfer = async function () {
	const buyAmount = document.getElementById('buy_amount').value;
	const buyUsing = document.getElementById('buy_using').value;
	const symbol = document.getElementById('symbols').value;
	if (symbol === '' || buyAmount === '') return;

	if (!checkTokenValueVsBuyAmount()) return false;

	showProgressStep('Approving ' + buyUsing + ' token.', 14);

	const tokenApproveResult = await getApproveTokenResult(buyUsing, buyAmount);
	if (tokenApproveResult == null) {
		hideProcessStep();
		return;
	}

	showProgressStep('Waiting on approval to execute to buy ' + symbol + ' for $' + buyAmount + '(-fee).', 28);
	var buyResult = await executeBuy(symbol, buyAmount, buyUsing);
	if (buyResult == null) {
		hideProcessStep();
		return;
	}

	var bought = buyResult.events.Bought;
	showProgressStep('Waiting for blockchain to confirm transaction.', 42);


	let query = new Moralis.Query('OrderBuy');
	let subscription = await query.subscribe();


	  subscription.on('update', (response) => {
		const object = response.toJSON();
		console.log('object updated', JSON.stringify(object), object);
		let ethLink = ' <a class="white-link" target="_blank" href="https://rinkeby.etherscan.io/tx/' + object.transaction_hash + '">View transaction</a>';

		console.log('status:', object.status);
		if (object.tokenAddress) {
			addTokenLink(symbol, object.tokenAddress);
		}

		if ((!object.status && object.confirmed) || object.status == 'money_sent') {
			showProgressStep('Blockchain has confirmed, money has been sent to broker.' + ethLink, 56)
			//blockchain has confirmed, money will arrive soon to broker
		} else if (object.status == 'money_arrived') {
			showProgressStep('Money has arrived, will now execute your buy order.' + ethLink, 70)
			//money has arrived to broker, we will now execute your order
		} else if (object.status == 'order_requested') {
			//order has been executed, we are waiting on response from the stock exchange
			showProgressStep('Buy order has been executed. We will update you when it has been filled.' + ethLink, 84)
		} else if (object.status == 'order_filled') {
			//order has been filled, you got object.filledQty of shares. You will see it soon in your wallet
			showProgressStep('Order has been filled, you will recieve ' + object.filledQty + symbol + ' soon into your wallet.' + ethLink, 100);
		}
	  });

};

const executeBuy = async function(symbol, buyAmount, buyUsing) {
	try {
	const liminalOptions = {
		contractAddress: LIMINAL_ADDRESS,
		functionName: "buy",
		abi: LiminalExchangeInfo.abi,
		params: {
			symbol: symbol,
			amount: Moralis.Units.Token(buyAmount, USDC_DECIMAL)
		},
	};

	return await Moralis.executeFunction(liminalOptions);
} catch (ex) {
	console.log(ex);
	return null;
}
}