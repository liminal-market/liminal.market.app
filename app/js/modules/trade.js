import {
	getContractsInfo
} from '../contracts/contract-addresses.js';
import LiminalExchangeInfo from "../abi/LiminalExchange.json" assert {	type: "json"};

import {
	USDC_ABI,
	USDC_ADDRESS,
	USDC_DECIMAL
} from './constants.js'
import { addTokenToWallet } from './helper.js';

const transfer = async function () {
	const buyAmount = document.getElementById('buy_amount').value;
	const symbol = document.getElementById('symbols').value;
	if (symbol == '') return;
	console.log('buyamount:', Moralis.Units.Token(buyAmount, USDC_DECIMAL), Moralis.Units.Token(buyAmount, USDC_DECIMAL).toString());
	const usdcOptions = {
		contractAddress: USDC_ADDRESS,
		functionName: "approve",
		abi: USDC_ABI,
		params: {
			_spender: LIMINAL_ADDRESS,
			_value: Moralis.Units.Token(buyAmount, USDC_DECIMAL)
		},
	};
	const tx = await Moralis.executeFunction(usdcOptions).then(async () => {
		const liminalOptions = {
			contractAddress: LIMINAL_ADDRESS,
			functionName: "buy",
			abi: LiminalExchangeInfo.abi,
			params: {
				symbol: symbol,
				amount: Moralis.Units.Token(buyAmount, USDC_DECIMAL)
			},
		};

		await Moralis.executeFunction(liminalOptions)
		.then(async (result) => {
			var bought = result.events.Bought;
			if (bought) {
				//TODO: this is hack while Chainlink node is not running, REMOVE should be done in contract
				Moralis.Cloud.run("buyOrder",
					{
						symbol : bought.returnValues.symbol,
						amount : Moralis.Units.FromWei(bought.returnValues.amount, 6),
						accountId : bought.returnValues.accountId
					}
				).then(function(response) {
					console.log('send buy order', response);
				});
			}
			console.log(result);
			let str = 'We are processing ' + Moralis.Units.FromWei(bought.returnValues[0], 6) + 'USDC to buy ' + bought.returnValues[2] + '. Fee was total:' + Moralis.Units.FromWei(bought.returnValues[3], 6) + ' USDC.';
			str += '<br /><br /><button id="addTokenToWallet">Add ' + bought.returnValues[2] + ' token to wallet</button>';
			$('#buy_success_message').show().html(str);
			document.getElementById('addTokenToWallet').onclick = async function() {
				await addTokenToWallet(bought.returnValues.tokenAddress, bought.returnValues.symbol);
			}
		});


	});
};



export const initTrade = async function () {
	document.getElementById('execute-trade').onclick = transfer;
	document.getElementById('buy_amount').onchange  = function() {
		$('#buy_success_message').hide();
	}
}