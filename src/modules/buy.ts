import { Main }  from '../main';

import {
	addTokenToWallet,
	roundNumber, getAssetBySymbol, AddressZero
} from './helper';
import {
	IsValidKYC,
	initKYC, KYCUserIsValid
} from './kyc';
import {
	render
} from './render';
import {
	login
} from './account';
import {tryGetNetwork} from '../networks/network-info';
import {IsMarketOpen, UserIsOffHours, isMarketOpen} from './market';
import {loadSecurities} from './securities';
import Moralis from 'moralis';
import BigNumber from 'bignumber';

let aUsdAmount;
let assetPrice = null;
let lastTraded = null;

export const ExecuteTradeOffHoursTxt = 'Execute trade <div class="small_print">It will take few hours to process, market is closed<br>You can enable "Off hours trading" in the Menu</div>';
let SelectedSymbolAddress = null;
let Symbol = '';
let LiminalMarketInfo;
let AUSDInfo;

export const buyPageInit = async function () {
	history.pushState(null, 'Buy securities', '/buy');

	document.getElementById('buy_amount').addEventListener('click', function(evt) {
		updateBuyInfo(Symbol);
	});

	setupSteps();
	setupAssets();

	let response = await fetch('../abi/LiminalMarket.json');
    LiminalMarketInfo = await response.json();

	response = await fetch('../abi/aUSD.json');
    AUSDInfo = await response.json();
};

export const selectSymbol = function(symbol, name, logo, address) {
	buyPageInit();

	if (!Moralis.Web3.isWeb3Enabled()) return;

	setSelectedSymbolAndAddress(symbol, address);

	let selectSymbolBtn = document.getElementById('select-symbol');
	selectSymbolBtn.innerHTML = name + ' (' + symbol + ')';

	updateBuyInfo(symbol, name, logo);
}

export const setupSteps = async function(showNetwork? : boolean) {
	document.querySelectorAll('.step').forEach((value, key) => {
		(value as HTMLElement).style.display = 'none';
	})

	const isMetaMaskInstalled = await Moralis.isMetaMaskInstalled();

	if (!isMetaMaskInstalled) {
		document.getElementById('install_metamask').style.display = 'block';
		return;
	}

	await Moralis.enableWeb3().then(function(response) {
		console.log('response', response);
	}).catch(function(reason) {
console.log('faile to enable', reason);
		document.getElementById('connect_wallet').style.display = 'block';
		//user has not connected the wallet

		document.getElementById('click_to_connect_wallet').addEventListener('click', async function(evt) {
			evt.preventDefault();
			await Moralis.enableWeb3();
			setupSteps();
		});
		return;

	}).finally(function() {
		console.log('finally')
	});
console.log('moralis chain:', Moralis.chainId);
	const chainId = parseInt(await Moralis.chainId, 16);;
	let networkInfo = tryGetNetwork(chainId);
	if (networkInfo) {
		Main.NetworkInfo.setNetwork(networkInfo);
	}
	console.log('chains:', chainId, networkInfo.ChainId);

	if (networkInfo.ChainId != chainId || showNetwork) {
		document.getElementById('select_network').style.display = 'block';
		if (window.location.href.indexOf('127.') != -1) {
			document.getElementById('network_localhost').style.display = 'block';
		}
		const options = document.querySelectorAll('.network_chooser');
		for (let i=0;i<options.length;i++) {
			options[i].addEventListener('click', async function(evt) {
				evt.preventDefault();
				console.log('chain id:', (evt.target as HTMLElement).dataset.chainid);
				try {
					const chainIdHex = await Moralis.switchNetwork((evt.target as HTMLElement).dataset.chainid)
					.then(async function() {
						await Moralis.User.logOut();
						window.location.reload();
					}).catch(function(err) {
						addNetworkToWallet(parseInt((evt.target as HTMLElement).dataset.chainid));
						console.log(err);
					});
				}catch (e) {
					console.log(e);
				}
			})
		}

		return;
	}
let user = Moralis.User.current();
console.log('user', user);
	if (user == null) {
		//user is not logged in, lets log you in
		document.getElementById('login_user').style.display = 'block';
		document.getElementById('click_to_login_user').addEventListener('click', function(evt) {
			evt.preventDefault();

			login(function() {
				setupSteps();
			})
			/*Moralis.authenticate().then(function (user) {
				setupSteps();
			}).catch(function(err) {
				document.getElementById('login_user_error').style.display = 'block';
			})*/
		});
		return;
	}

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

	await checkBalanceOfAUsd();

	if (aUsdAmount < 1) {
		//show funding step
		document.getElementById('fund_account').style.display = 'block';
		document.getElementById('account_not_ready').style.display = "none";
		document.getElementById('add_ausd_to_wallet').addEventListener('click', async function(evt) {
			evt.preventDefault();

			await addTokenToWallet(Main.ContractAddressesInfo.AUSD_ADDRESS, 'aUSD');
		});

		document.getElementById('fundUSDC').addEventListener('click', function(evt) {
			evt.preventDefault();
			//fund usdc
			//transferUSDC();
		});
		document.getElementById('fundAUSD').addEventListener('click', function(evt) {
			evt.preventDefault();
			// fund ausd, moralis
			fundUser();

		})

		return;
	}

	//lets buy securities

};

const addNetworkToWallet = async function(chainId : number) {
	let networkInfo = tryGetNetwork(chainId);

	const web3 = await Moralis.enableWeb3();
	web3.provider.request({
		method: 'wallet_addEthereumChain',
		params: {
			chainId: chainId,
			chainName: networkInfo.ChainName,
			nativeCurrency: {
				name: networkInfo.NativeCurrencyName,
				symbol: networkInfo.NativeSymbol,
				decimals: networkInfo.NativeDecimal
			},
			rpcUrls: [networkInfo.RpcUrl],
			blockExplorerUrls: [networkInfo.BlockExplorer]
		}
	}).catch((error) => {
		console.log(error)
	})
}

const fundUser = async function() {
	const params = {
		chainId: Main.NetworkInfo.ChainId
	};
	document.getElementById('account_not_ready').style.display = "none";
	Moralis.Cloud.run('fundUser', params).then(function(response) {
		showWaitingForFunding();
		return;

	}).catch(function(err) {
		document.getElementById('account_not_ready').style.display = "block";
	});
}

const checkNativeTokenStatus = async function() {
	const options : any = { chain: Main.NetworkInfo.Name };
	const result = await Moralis.Web3API.account.getNativeBalance(options);
//0.002998
	const balance = parseFloat(Moralis.Units.FromWei(result.balance, 18));
	if (SelectedSymbolAddress == AddressZero && balance < 0.005) {
		showNeedNativeToken();
	} else if (balance < 0.0007) {
		showNeedNativeToken();
	} else {
		document.getElementById('need_native_token').style.display = 'none';
	}
};

const showNeedNativeToken = async function() {
	const user = await Moralis.User.current();

	document.getElementById('need_native_token').style.display = 'block';
	(document.getElementById('native_token_address') as HTMLInputElement).value = await user.get('ethAddress');

	setTimeout(checkNativeTokenStatus, 20*1000);
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


const showWaitingForFunding = function() {
	document.getElementById('waiting_for_funding').style.display = 'block';
	document.getElementById('buy_securities_wrapper').style.display = 'block';
	document.getElementById('fund_account').style.display = 'none';

	document.getElementById('buy_headline').innerHTML = "Let's play... 🚀🚀🚀";
	let text = "You currently have <strong>$" + roundNumber(aUsdAmount) + " aUSD</strong>."
		+ " Lets try it anyway. Type in any amount in the box below and select a symbol."
		+ " You will see how many shares you will get for that amount";
	document.getElementById('buy_text').innerHTML = text;

	checkBalanceOfAUsd();
}

const checkBalanceOfAUsd = async function() {

	aUsdAmount = await getAUSDAmount();

	if (aUsdAmount >= 1) {
		document.getElementById('waiting_for_funding').style.display = 'none';
		document.getElementById('buy_headline').innerHTML = "Let's buy something!";
		let text = "You currently have <strong>$" + roundNumber(aUsdAmount) + " aUSD.</strong>"
				+ " You can now buy your own securities.";
		document.getElementById('buy_text').innerHTML = text;
		updateBuyInfo(Symbol);
		showUseWalletForOrders();
	} else {
		setTimeout(await checkBalanceOfAUsd, 30 * 1000);
	}
}

const showUseWalletForOrders = function() {
	document.getElementById('create-order').classList.add('sidebar');
	document.getElementById('use_wallet_for_orders').style.display = 'inline-block';
	document.getElementById('buy_securities_wrapper').style.display='inline-block';
}


const getAUSDAmount = async function () {
	const user = await Moralis.User.current();
	if (!user) return 0;

	const ethAddress = await user.get('ethAddress');
	const ausdcOptions = {
		contractAddress: Main.ContractAddressesInfo.AUSD_ADDRESS,
		functionName: "balanceOf",
		abi: AUSDInfo.abi,
		params: {
			account: ethAddress
		}
	};

	let amount = await Moralis.executeFunction(ausdcOptions).then(balanceOf => {
		console.log('balanceOf obj:', balanceOf)


		let amount = Moralis.Units.FromWei(balanceOf as BigNumber, 18);
		document.getElementById('add_ausd_to_wallet_menu').innerHTML = 'You have ' + roundNumber(parseFloat(amount)) + ' aUSD in your broker account';
		return amount;
	}).catch(function(err) {
		console.error(err);
	});
	return amount;
}

const setupAssets = async function () {
	document.getElementById('select-symbol').addEventListener('click', function(evt) {
		loadSecuritiesModal(evt);
	});
	document.getElementById('buy_amount').onchange = function() {
		updateBuyInfo(Symbol);
	}

	document.getElementById('findSymbol').addEventListener('click', function(evt) {
		loadSecuritiesModal(evt);
	});
};

const loadSecuritiesModal = async function(evt) {
	evt.preventDefault();
	document.getElementById('modalSecurities').style.display='block';
	document.getElementById('backdrop').style.display='block';
	document.getElementById('modalSecurities').addEventListener('click', function(evt){
		console.log((evt.target as HTMLElement).id);
		if ((evt.target as HTMLElement).id == 'modalSecurities' || (evt.target as HTMLElement).id == 'closeModal') {
			hideModalSecurities();
		}
	})

	render('securities', null, function() {loadSecurities(true)}, 'modal-body');
};

export const hideModalSecurities = function() {
	document.getElementById('modalSecurities').style.display='none';
	document.getElementById('backdrop').style.display='none';
}



const getSymbolPrice = async function (evt? : Event) {
	if (evt) {
		evt.preventDefault();
	}

	if (Symbol === '') {
		assetPrice = 0;
		lastTraded = '';
		return;
	}

	offHoursInfo();
	SelectedSymbolAddress = await getSymbolContractAddress(Symbol);
	console.log('contractAddresss:', SelectedSymbolAddress);
	if (SelectedSymbolAddress == AddressZero) {
		document.getElementById('execute-trade').innerHTML = "Create token & execute trade";
		//TODO for sandbox lets not show this, but for live we need to show.
		//document.getElementById('add-token-info').style.display='block';
		//document.getElementById('add-token-info').innerHTML = "<div >We will need to create the token when you buy it. Since you are the first one to buy this symbol, this will incure extra cost. It's a low cost</div>";
	} else {
		document.getElementById('execute-trade').innerHTML = "Execute trade";
		addTokenLink(Symbol, SelectedSymbolAddress);
	}

	await loadAssetPrice();
	updateBuyInfo(Symbol);
}

const loadAssetPrice = async function() {

	const params = {
		symbol: Symbol
	};
	return await Moralis.Cloud.run("getSymbolPrice", params).then(function (jsonResult) {
		assetPrice = jsonResult.trade.p;
		lastTraded = jsonResult.trade.t;
	});
}

export const getSymbolContractAddress = async function(symbol) {

			const securityTokenOptions = {
			contractAddress: Main.ContractAddressesInfo.LIMINAL_MARKET_ADDRESS,
			functionName: "getSecurityToken",
			abi: LiminalMarketInfo.abi,
			params: {
				symbol: symbol
			}
		};
		return await Moralis.executeFunction(securityTokenOptions);

}

const offHoursInfo = async function() {
	await isMarketOpen();

	if (!IsMarketOpen && !UserIsOffHours) {
		document.getElementById('offHoursInfo').style.display = 'block';
		document.getElementById('execute-trade').innerHTML = ExecuteTradeOffHoursTxt;
	} else {
		document.getElementById('offHoursInfo').style.display = 'none';
		document.getElementById('execute-trade').innerHTML = 'Execute trade';
	}
};

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
	checkTokenValueVsBuyAmount();
};

export const checkTokenValueVsBuyAmount = async function () {
	document.getElementById('buy_danger_message').style.display = 'none';
	let buyAmount = (document.getElementById('buy_amount') as HTMLInputElement).value;

	var user = Moralis.User.current();
	if (!user) {
		document.getElementById('buy_danger_message').style.display = 'block';
		let str = 'You are not logged in. Login in the menu at top.';
		document.getElementById('buy_danger_message').innerHTML = str;
		return false;
	}

	document.getElementById('execute-trade').classList.add('disabled');
	document.getElementById('execute-trade').classList.remove('enabled');

	if (aUsdAmount < buyAmount) {
		document.getElementById('buy_danger_message').style.display = 'block';
		document.getElementById('buy_danger_message').innerHTML = "You don't have enough aUSD tokens in your wallet.";
		return false;
	}
	checkNativeTokenStatus();
	await setupBuyButton();
};


const showProgressStep = async function (text : string, perc : number, warning? : boolean) {

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

};

const hideProcessStep = function() {
	document.getElementById('buy_progress').style.display = "none";
	document.getElementById('execute-trade').style.display='block';
};



const transfer = async function () {
	const buyAmount = (document.getElementById('buy_amount') as HTMLInputElement).value;
	if (Symbol === '' || buyAmount === '') return;

	if (!checkTokenValueVsBuyAmount()) return false;
	document.getElementById('execute-trade').style.display='none';

	if(SelectedSymbolAddress == null) {
		SelectedSymbolAddress = await getSymbolContractAddress(Symbol);
	}

	if (SelectedSymbolAddress == AddressZero) {

		showProgressStep('First we need to create token, you need to confirm', 99);
		setTimeout(function () { checkToShowMetamaskIcon('First we need') }, (10 * 1000));

		let txResult = await executeCreateToken(Symbol).catch(function(err) {
			hideProcessStep();
			return null;
		});
		if(txResult == null) return;

		console.log(txResult);
		if (txResult.events.TokenCreated) {
			SelectedSymbolAddress = txResult.events.TokenCreated.returnValues.tokenAddress;
		}
	}

	console.log('recipent', SelectedSymbolAddress);
	if (SelectedSymbolAddress == AddressZero) return;
	document.getElementById('execute-trade').innerHTML = "Execute trade";
	let waitingStr = 'Waiting on approval to execute to buy ';
	showProgressStep(waitingStr + Symbol + ' for $' + buyAmount + '.', 99);
	setTimeout(function () { checkToShowMetamaskIcon(waitingStr) }, 10 * 1000);


	await subscribeToTable();

	var buyResult = await executeBuy(SelectedSymbolAddress, parseFloat(buyAmount));
	if (buyResult == null) {
		hideProcessStep();
		return;
	}

	console.log('buyResult', buyResult);


	document.getElementById('add-token-info').style.display = 'none';


};
const subscribeToTable = async function() {
	console.log('subscribe to table:' + getOrderBuyTablePrefix() + 'OrderBuy');

	let query = new Moralis.Query(getOrderBuyTablePrefix() + 'OrderBuy');
	let subscription = await query.subscribe();

	subscription.on('update', (response) => {
		const object = response.toJSON();
		console.log('object updated', JSON.stringify(object), object);
		let ethLink = ' <a class="white-link" target="_blank" href="https://rinkeby.etherscan.io/tx/' + object.transaction_hash + '">View transaction</a>';

		console.log('status:', object.status);
		if (object.tokenAddress) {
			addTokenLinkBottom(Symbol, SelectedSymbolAddress);
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
			document.getElementById('buy-info').style.display = 'none';
			//order has been filled, you got object.filledQty of shares. You will see it soon in your wallet
			showProgressStep('Order has been filled, you will recieve ' + object.filledQty + ' ' + Symbol + ' soon into your wallet.' + ethLink, 100);
		} else {
			showProgressStep('Waiting for blockchain to confirm transaction.', 99);
		}
	});
};


const getOrderBuyTablePrefix = function() {
	if (Main.NetworkInfo.ChainId == 43113) return "Fuji";
	return "";
};

const checkToShowMetamaskIcon = function(txt : string) {
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
};


const executeBuy = async function(recipient : string, buyAmount : number) {
	try {
		const liminalOptions = {
			contractAddress: Main.ContractAddressesInfo.AUSD_ADDRESS,
			functionName: "transfer",
			abi: AUSDInfo.abi,
			params: {
				recipient: recipient,
				amount: Moralis.Units.Token(buyAmount, 18)
			},
		};

		return await Moralis.executeFunction(liminalOptions);
	} catch (ex) {
		console.log(ex);
		return null;
	}
};

const executeCreateToken = async function(symbol : string) {

	const liminalOptions = {
		contractAddress: Main.ContractAddressesInfo.LIMINAL_MARKET_ADDRESS,
		functionName: "createToken",
		abi: LiminalMarketInfo.abi,
		params: {
			symbol: symbol
		},
	};

	return await Moralis.executeFunction(liminalOptions);

};

export const setSelectedSymbolAndAddress = function(symbol : string, address : string) {
	SelectedSymbolAddress = address;
	Symbol = symbol;

	getSymbolPrice();
};