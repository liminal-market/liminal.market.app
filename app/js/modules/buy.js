import { ContractAddressesInfo }  from '../main.js';

import LiminalExchangeInfo from "../abi/LiminalExchange.json" assert {	type: "json"};
import SecurityFactoryInfo from "../abi/SecurityFactory.json" assert {	type: "json"};
import SecurityTokenInfo from "../abi/SecurityToken.json" assert {	type: "json"};
import AUSDInfo from "../abi/aUSD.json" assert { type: "json"};

import {
	USDC_ABI,
	USDC_ADDRESS,
	USDC_DECIMAL
} from './constants.js'
import {
	addTokenToWallet,
	roundNumber, getAssets, getAssetBySymbol
} from './helper.js';
import {
	IsValidKYC,
	initKYC, KYCUserIsValid
} from './kyc.js';
import {
	render
} from './render.js';
import {
	login
} from './account.js';
import {IsMarketOpen, UserIsOffHours, isMarketOpen} from './market.js';

let aUsdAmount;

export const buyPageInit = function () {
	document.getElementById('buy_amount').onchange = updateBuyInfo;

	setupSteps();
	setupAssets();
};

const setupSteps = async function() {
	document.querySelectorAll('.step').forEach((value, key) => {
		value.style.display = 'none';
	})

	const isMetaMaskInstalled = (!window.ethereum) ? false : await Moralis.isMetaMaskInstalled();

	if (!isMetaMaskInstalled) {
		document.getElementById('install_metamask').style.display = 'block';
		return;
	}

	if (window.ethereum.selectedAddress === null) {
		document.getElementById('connect_wallet').style.display = 'block';
		//user has not connected the wallet

		document.getElementById('click_to_connect_wallet').addEventListener('click', async function(evt) {
			evt.preventDefault();
			await Moralis.enableWeb3();
			setupSteps();
		});
		return;
	}

	if (Moralis.User.current() == null) {
		//user is not logged in, lets log you in
		document.getElementById('login_user').style.display = 'block';
		document.getElementById('click_to_login_user').addEventListener('click', function(evt) {
			evt.preventDefault();
			Moralis.authenticate().then(function (user) {
				setupSteps();
			}).catch(function(err) {
				document.getElementById('login_user_error').style.display = 'block';
			})
		});
		return;
	}
	await Moralis.enableWeb3();
	await KYCUserIsValid();
	console.log('IsValidKYC:', IsValidKYC);
	if (!IsValidKYC) {

		//user needs to do kyc
		document.getElementById('kyc_registration').style.display = 'block';
		document.getElementById('click_to_kyc_reg').addEventListener('click', function(evt) {
			evt.preventDefault();

			render('kyc', null, initKYC);
		})
		return;
	}


	aUsdAmount = await getAUSDAmount();

	if (aUsdAmount == 0) {
		//show funding step
		document.getElementById('fund_account').style.display = 'block';
		document.getElementById('add_ausd_to_wallet').addEventListener('click', async function(evt) {
			evt.preventDefault();

			await addTokenToWallet(ContractAddressesInfo.AUSD_ADDRESS, 'aUSD');
		});

		document.getElementById('fundUSDC').addEventListener('click', function(evt) {
			evt.preventDefault();
			//fund usdc
			transferUSDC();
		});
		document.getElementById('fundAUSD').addEventListener('click', function(evt) {
			evt.preventDefault();
			// fund ausd, moralis
			fundUser();

		})

		return;
	}

	//lets buy securities
	checkBalanceOfAUsd();


};

const fundUser = async function() {
	Moralis.Cloud.run('fundUser').then(function(response) {
		showTransferSteps('Sending you $50 aUSD', 50);
		showWaitingForFunding();
		return;

	});
}

const setupBuyButton = function () {

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

const transferUSDC = async function() {
	// sending 0.5 tokens with 18 decimals
	const amount = document.getElementById('fund_account_amount').value;
	let bigInt = Moralis.Units.Token(amount, "6");

	console.log('bigInt', bigInt, bigInt.toString())
	const options = {
		type: "erc20",
		amount: bigInt,
		receiver: ContractAddressesInfo.AUSD_ADDRESS,
		contractAddress: ContractAddressesInfo.USDC_ADDRESS
	};

	showTransferSteps('Lets transfer', 50);
	showWaitingForFunding();
	return;

}

const showWaitingForFunding = function() {
	document.getElementById('waiting_for_funding').style.display = 'block';
	document.getElementById('fund_account').style.display = 'none';

	document.getElementById('buy_headline').innerHTML = "Let's play... 🚀🚀🚀";
	let text = "You currently have <strong>$" + aUsdAmount + " aUSD</strong>."
		+ " Lets try it anyway. Type in any amount in the box below and select a symbol."
		+ " You will see how many shares you will get for that amount";
	document.getElementById('buy_text').innerHTML = text;

	checkBalanceOfAUsd();
}

const checkBalanceOfAUsd = async function() {
	console.log('checkBalanceOfAUsd');

	let aUsdAmount = await getAUSDAmount();

	if (aUsdAmount > 0) {
		document.getElementById('waiting_for_funding').style.display = 'none';
		document.getElementById('buy_headline').innerHTML = "Let's buy something!";
		let text = "You currently have <strong>$" + aUsdAmount + " aUSD.</strong>"
				+ " You can now buy your own securities.";
		document.getElementById('buy_text').innerHTML = text;

		showUseWalletForOrders();
	} else {
		setTimeout(await checkBalanceOfAUsd, 30 * 1000);
	}
}

const showUseWalletForOrders = function() {
	document.getElementById('create-order').classList.add('sidebar');
	document.getElementById('use_wallet_for_orders').style.display = 'inline-block';
}

const hideTransferSteps = function() {
	document.getElementById('fund_progress').style.display = 'none';
}

const showTransferSteps = function(text, perc, warning) {
	document.getElementById('fund_progress').style.display = 'block';
	var element = document.getElementById('fund_progress_steps');
	element.innerHTML = '<div class="progress_text">' + text + '</div>';
	element.style.width = perc + '%';

	element.classList.toggle('progress-bar-striped', (perc != 100));
	element.classList.toggle('progress-bar-animated', (perc != 100));
	if (warning) {
		element.classList.add('bg-warning');
		element.classList.add('progress_text_attn');
	} else {
		element.classList.remove('bg-warning');
		element.classList.remove('progress_text_attn');
	}
}

const getAUSDAmount = async function () {
	const user = await Moralis.User.current();
	if (!user) return 0;

	const ethAddress = await user.get('ethAddress');
	const ausdcOptions = {
		contractAddress: ContractAddressesInfo.AUSD_ADDRESS,
		functionName: "balanceOf",
		abi: AUSDInfo.abi,
		params: {
			account: ethAddress
		}
	};

	let amount = await Moralis.executeFunction(ausdcOptions).then((balanceOf) => {
		let amount = Moralis.Units.FromWei(balanceOf, 18);
		return amount;
	}).catch(function(err) {
		console.error(err);
	});
	return amount;
}




const setupAssets = async function () {
	document.getElementById('symbols').onchange = getSymbolPrice;
	document.getElementById('buy_amount').onchange = updateBuyInfo;

	let str = '';
	const assets = await getAssets();
	assets.forEach(function (asset) {
		str += '<option value="' + asset.Symbol + '">' + asset.Symbol + ' - ' + asset.Name + '</option>';
	});

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

	offHoursInfo();

	const securityTokenOptions = {
		contractAddress: ContractAddressesInfo.SECURITY_FACTORY_ADDRESS,
		functionName: "getSecurityToken",
		abi: SecurityFactoryInfo.abi,
		params: {
			symbol: symbol
		}
	};
	Moralis.executeFunction(securityTokenOptions).then((contractAddress) => {
		if (contractAddress == "0x0000000000000000000000000000000000000000") {
			document.getElementById('addWalletSpan').innerHTML = '';
			//TODO for sandbox lets not show this, but for live we need to show.
			//document.getElementById('add-token-info').style.display='block';
			//document.getElementById('add-token-info').innerHTML = "<div >We will need to create the token when you buy it. Since you are the first one to buy this symbol, this will incure extra cost. It's a low cost</div>";
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

const offHoursInfo = async function() {
	await isMarketOpen();

	if (!IsMarketOpen && !UserIsOffHours) {
		document.getElementById('offHoursInfo').style.display = 'block';
	} else {
		document.getElementById('offHoursInfo').style.display = 'none';
	}
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

export const addTokenLinkBottom = async function(symbol, contractAddress) {
	const asset = await getAssetBySymbol(symbol);

	document.getElementById('addNewTokenToWallet').style.display = 'block';
	document.getElementById('tokenLogo').src = '/img/logos/' + asset.Logo;
	document.getElementById('addNewTokenText').innerHTML = 'Add ' + symbol + ' to your wallet.';
	document.getElementById('addNewToken').onclick = async function (evt) {
		evt.preventDefault();
		await addTokenToWallet(contractAddress, symbol);
	}

}

window.addTokenLinkBottom = addTokenLinkBottom;

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

export const checkTokenValueVsBuyAmount = async function () {
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
		let str = "You don't have any aUSD tokens in your wallet. aUSD is only available after you have sold shares. Go through step above to fill up your aUSD.";
		document.getElementById('buy_danger_message').innerHTML = str;

		return false;
	}
	if (userTokenValue < buyAmount) {
		document.getElementById('buy_danger_message').style.display = 'block';
		document.getElementById('buy_danger_message').innerHTML = "You don't have enough " + buy_using + " tokens in your wallet."
		return false;
	}
	await setupBuyButton();

}


const showProgressStep = async function (text, perc, warning) {

	document.getElementById('buy_progress').style.display = "block";
	var element = document.getElementById('buying_steps');
	element.innerHTML = '<div class="progress_text">' + text + '</div>';
	element.style.width = perc + '%';

	element.classList.toggle('progress-bar-striped', (perc != 100));
	element.classList.toggle('progress-bar-animated', (perc != 100));
	if (warning) {
		element.classList.add('bg-warning');
		element.classList.add('progress_text_attn');
	} else {
		element.classList.remove('bg-warning');
		element.classList.remove('progress_text_attn');
	}

}

const hideProcessStep = function() {
	document.getElementById('buy_progress').style.display = "none";
	document.getElementById('execute-trade').style.display='block';
}

const getApproveTokenResult = async function (buyUsing, buyAmount) {
	try {
		let ethAddress = Moralis.User.current().get('ethAddress');
		if (buyUsing === 'USDC') {

			console.log('buyamount:', Moralis.Units.Token(buyAmount, USDC_DECIMAL), Moralis.Units.Token(buyAmount, USDC_DECIMAL).toString());
			let usdcOptions = {
				contractAddress: ContractAddressesInfo.USDC_ADDRESS,
				functionName: "allowance",
				abi: USDC_ABI,
				params: {
					owner: ethAddress,
					spender: ContractAddressesInfo.LIMINAL_ADDRESS
				},
			};
			let allowance = await Moralis.executeFunction(usdcOptions);
			console.log('allowance:', Moralis.Units.Token(allowance, USDC_DECIMAL).toString(), Moralis.Units.Token(buyAmount, USDC_DECIMAL).toString());
			if (parseFloat(Moralis.Units.Token(buyAmount, USDC_DECIMAL).toString()) <= allowance) {
				return parseFloat(Moralis.Units.Token(allowance, USDC_DECIMAL).toString());
			}

			usdcOptions = {
				contractAddress: ContractAddressesInfo.USDC_ADDRESS,
				functionName: "approve",
				abi: USDC_ABI,
				params: {
					_spender: ContractAddressesInfo.LIMINAL_ADDRESS,
					_value: Moralis.Units.Token(buyAmount, USDC_DECIMAL)
				},
			};
			return await Moralis.executeFunction(usdcOptions);

		} else {
			let aUsdOptions = {
				contractAddress: ContractAddressesInfo.AUSD_ADDRESS,
				functionName: "allowance",
				abi: AUSDInfo.abi,
				params: {
					owner: ethAddress,
					spender: ContractAddressesInfo.LIMINAL_ADDRESS
				},
			};
			let allowance = await Moralis.executeFunction(aUsdOptions);
			console.log('allowance:', allowance);
			if (Moralis.Units.Token(buyAmount, 18) <= allowance) {
				return allowance;
			}

			aUsdOptions = {
				contractAddress: ContractAddressesInfo.AUSD_ADDRESS,
				functionName: "approve",
				abi: AUSDInfo.abi,
				params: {
					_spender: ContractAddressesInfo.LIMINAL_ADDRESS,
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
	document.getElementById('execute-trade').style.display='none';

	let approvalStr = 'Approving ' + buyUsing + ' token.';
	showProgressStep(approvalStr, 14);
	setTimeout(function () { checkToShowMetamaskIcon(approvalStr) }, 10 * 1000)
	const tokenApproveResult = await getApproveTokenResult(buyUsing, buyAmount);
	if (tokenApproveResult == null) {
		hideProcessStep();
		return;
	}

	let waitingStr = 'Waiting on approval to execute to buy ';
	showProgressStep(waitingStr + symbol + ' for $' + buyAmount + '(-fee).', 28);
	setTimeout(function () { checkToShowMetamaskIcon(waitingStr) }, 10 * 1000)
	var buyResult = await executeBuy(symbol, buyAmount, buyUsing);
	if (buyResult == null) {
		hideProcessStep();
		return;
	}

	var bought = buyResult.events.Bought;
	showProgressStep('Waiting for blockchain to confirm transaction.', 42);

	document.getElementById('add-token-info').style.display = 'none';

	let query = new Moralis.Query('OrderBuy');
	let subscription = await query.subscribe();


	  subscription.on('update', (response) => {
		const object = response.toJSON();
		console.log('object updated', JSON.stringify(object), object);
		let ethLink = ' <a class="white-link" target="_blank" href="https://rinkeby.etherscan.io/tx/' + object.transaction_hash + '">View transaction</a>';

		console.log('status:', object.status);
		if (object.tokenAddress) {
			addTokenLinkBottom(symbol, object.tokenAddress);
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
			showProgressStep('Order has been filled, you will recieve ' + object.filledQty + ' ' + symbol + ' soon into your wallet.' + ethLink, 100);
		}
	  });

};



const checkToShowMetamaskIcon = function(txt) {
	//Waiting on approval to execute
	if (document.getElementById('buy_progress').style.display != "none" && document.getElementById('buying_steps').innerText.indexOf(txt) != -1) {
		showProgressStep('Hey Ho! Is Metamask be waiting for you?<br />Check top right corner of your browser <img src="/img/metamask-pending.png"/>', 99, true);
	}

	setTimeout(function () { blockshainSlowMessage(); }, 8 * 1000)
}

const blockshainSlowMessage = function() {

	if (document.getElementById('buy_progress').style.display != "none" && document.getElementById('buying_steps').innerText.indexOf('Hey Ho!') != -1) {
		showProgressStep('If you have already approved, maybe blockchain is slow. Lets give it a bit. Just double check for <img src="/img/metamask-pending.png"/>', 99, true);
	}
}


const executeBuy = async function(symbol, buyAmount) {
	try {
		const liminalOptions = {
			contractAddress: ContractAddressesInfo.LIMINAL_ADDRESS,
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