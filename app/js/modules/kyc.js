import KYCInfo from "../abi/KYC.json" assert {	type: "json"};
import { Main }  from '../main.js';

import { errorHandler } from "./error.js";
import { render } from "./render.js";
import {buyPageInit} from './buy.js';
import { isJSON } from "./helper.js";

export let AlpacaId;

export const initKYC = async function () {
	AlpacaId = (await Moralis.User.current().fetch()).get('alpacaId');
	AlpacaId = undefined;
	console.log('alpacaId:', AlpacaId);
	if (!AlpacaId) {
		document.getElementById('kyc_reg').style.display='block';
		document.getElementById('writeToBlockcahin').style.display='none';
		document.getElementById('submitKYC').onclick = submitKYC;

		loadName();

	} else {
		showWriteToBlockchain();
	}
}



const loadName = function() {
	var characters = [
		{given_name : 'Leslie', family_name : 'Knope', email_address:'leslie.knope' },
		{given_name : 'April', family_name : 'Ludgate', email_address:'april.ludgate' },
		{given_name : 'Jerry', family_name : 'Gergich', email_address:'jerry.gergich' },
		{given_name : 'Tom', family_name : 'Haverford', email_address:'tom.haverford' },
		{given_name : 'Donna', family_name : 'Meagle', email_address:'donna.meagle' },
		{given_name : 'Andy', family_name : 'Dwyer', email_address:'andy.dwyer' },
		{given_name : 'Ann', family_name : 'Perkins', email_address:'ann.perkins' },
		{given_name : 'Ben', family_name : 'Wyatt', email_address:'ben.wyatt' },
		{given_name : 'Chris', family_name : 'Traeger', email_address:'chris.traeger' },
		{given_name : 'Jean-Ralphio', family_name : 'Saperstein', email_address:'jean-ralphio.saperstein' },
		{given_name : 'Councilman', family_name : 'Jamm', email_address:'jamm' }
	]

	let idx = Math.floor(Math.random() * characters.length) % characters.length;
	var character = characters[idx];
	document.getElementById('given_name').value = character.given_name;
	document.getElementById('family_name').value = character.family_name;
	document.getElementById('email_address').value = character.email_address + '.' + (new Date().getTime()) + '@parks-and-rec-example.com';

}


const submitKYC = async function () {
	showProgressStep('Register KYC with broker', 33);
	const form = document.kyc_wizard_form;
	let data = new FormData(form);

	let params = serialize(data);

	AlpacaId = await Moralis.Cloud.run("kycRegistration", params);

	let user = Moralis.User.current();
	user.set('alpacaId', AlpacaId);
	user.save();

	KYCUserToSmartContract(AlpacaId);
	return false;
}
const showProgressStep = async function (text, perc, warning) {
	document.getElementById('btnWriteToBlockchain').style.display = "none";
	document.getElementById('submitKYC').style.display = "none";
	document.getElementById('kyc_progress').style.display = "block";
	var element = document.getElementById('kyc_steps');
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

const isValidAccountId = function(str) {
	const regex = new RegExp('^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$');
	return regex.test(str);
}


export const KYCUserToSmartContract = async function (accountId) {
	if (!isValidAccountId(accountId)) {
		showProgressStep('Your account id was invalid. This should not happen, <a href="https://discord.gg/dBUdUzmV" target="_blank">ping us on Discord</a>', 100, true);
		return;
	}

	const str = 'Writing to blockchain, you must confirm transaction in your wallet';
	showProgressStep(str, 66);
	setTimeout(function () { checkToShowMetamaskIcon(str) }, 10 * 1000)
	const kycOptions = {
		contractAddress: Main.ContractAddressesInfo.KYC_ADDRESS,
		functionName: "validateAccount",
		abi: KYCInfo.abi,
		params: {
			accountId: accountId
		},
	};

	await Moralis.executeFunction(kycOptions).then(async (result) => {
		console.log('KYCUserToSmartContract result', result);
		IsValidKYC = true;
		showProgressStep('Done, loading buy page...', 100);

		render('buy', null, buyPageInit);
	}).catch(function(err) {
		console.log(err);
		showWriteToBlockchain();
	});

	console.log('writing to blockcahin', kycOptions);
}


const checkToShowMetamaskIcon = function(txt) {
	//Waiting on approval to execute
	if (document.getElementById('kyc_progress') && document.getElementById('kyc_progress').style.display != "none" && document.getElementById('kyc_steps').innerText.indexOf(txt) != -1) {
		showProgressStep('Hey Ho! Is Metamask be waiting for you?<br />Check top right corner of your browser <img src="/img/metamask-pending.png"/>', 99, true);
		setTimeout(function () { blockshainSlowMessage(); }, 8 * 1000);
	}
};

const blockshainSlowMessage = function() {

	if (document.getElementById('kyc_progress') && document.getElementById('kyc_progress').style.display != "none" && document.getElementById('kyc_steps').innerText.indexOf('Hey Ho!') != -1) {
		showProgressStep('If you have already approved, maybe blockchain is slow. Lets give it a bit. Just double check for <img src="/img/metamask-pending.png"/>', 99, true);
	}
}

const showWriteToBlockchain = async function() {
	const user = await Moralis.User.current();

	document.getElementById('need_native_token').style.display = 'block';
	document.getElementById('native_token_address').value = await user.get('ethAddress');

	document.getElementById('btnWriteToBlockchain').style.display = "block";
	document.getElementById('submitKYC').style.display = "block";
	document.getElementById('kyc_progress').style.display = 'none';
	document.getElementById('kyc_reg').style.display='none';
	document.getElementById('writeToBlockcahin').style.display='block';
	document.getElementById('btnWriteToBlockchain').addEventListener('click', function(evt) {
		evt.preventDefault();

		KYCUserToSmartContract(AlpacaId);
	});
}

function serialize(data) {
	let obj = {};
	for (let [key, value] of data) {
		if (obj[key] !== undefined) {
			if (!Array.isArray(obj[key])) {
				obj[key] = [obj[key]];
			}
			obj[key].push(value);
		} else {
			obj[key] = value;
		}
	}
	return obj;
}


export let IsValidKYC = false;

export const KYCUserIsValid = async function () {
	if (IsValidKYC) return true;

	const kycOptions = {
		contractAddress: Main.ContractAddressesInfo.KYC_ADDRESS,
		functionName: "isValid",
		abi: KYCInfo.abi,
		params: {
			userAddress: Moralis.User.current().get('ethAddress')
		}
	};

	await Moralis.executeFunction(kycOptions).then(async (result) => {
		console.log('kyc result:', result);
		if (isValidAccountId(result)) {
			IsValidKYC = true;

			var user = Moralis.User.current();
			if (!user.get('alpacaId')) {
				user.save({alpacaId : result});
				await Moralis.User.current().fetch();
			}

			return;
		}
	}).catch(function(err) {
		console.log('Not KYC valid', err);
	});

}


