import KYCInfo from "../abi/KYC.json" assert {	type: "json"};
import { ContractAddressesInfo }  from '../main.js';

import { errorHandler } from "./error.js";
import { render } from "./render.js";
import {buyPageInit} from './buy.js';
import { isJSON } from "./helper.js";


export const initKYC = async function () {
	var brokerId = await Moralis.User.current().get('alpacaId');
	console.log(brokerId);
	if (!brokerId) {
		document.getElementById('kyc_reg').style.display='block';
		document.getElementById('writeToBlockcahin').style.display='none';
		document.getElementById('submitKYC').onclick = submitKYC;
		document.getElementById('email_address').value = 'ron.swanson-' + (new Date().getTime()) + '@parks-and-rec-example.com';
	} else {
		document.getElementById('kyc_reg').style.display='none';
		document.getElementById('writeToBlockcahin').style.display='block';
		document.getElementById('btnWriteToBlockchain').addEventListener('click', function(evt) {
			evt.preventDefault();
			KYCUserToSmartContract(brokerId);
		});
	}
}


const submitKYC = async function () {
	const form = document.kyc_wizard_form;
	let data = new FormData(form);

	let params = serialize(data);

	var response = await Moralis.Cloud.run("kycRegistration", params);

	console.log(response);
	const result = JSON.parse(response);
	if (result.code) {
		showError(result.message);
		return;
	}

	await Moralis.User.current().set('alpacaId', result)
	console.log(result);
	KYCUserToSmartContract(result);
	return false;
}


const isValidAccountId = function(str) {
	const regex = new RegExp('^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$');
	return regex.test(str);
}


export const KYCUserToSmartContract = async function (accountId) {
	if (!isValidAccountId(accountId)) {
		console.log('accountId ' + accountId + ' didnt match regex');
		return;
	}

	const kycOptions = {
		contractAddress: ContractAddressesInfo.KYC_ADDRESS,
		functionName: "validateAccount",
		abi: KYCInfo.abi,
		params: {
			accountId: accountId
		},
	};

	await Moralis.executeFunction(kycOptions).then(async (result) => {
		console.log('KYCUserToSmartContract result', result);
		IsValidKYC = true;
		render('buy', null, buyPageInit);
	});

	console.log('writing to blockcahin', kycOptions);
}

function showError(text) {
	$('#kycError').html(text).show();
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

	console.log('KYCUserIsValid')
	const kycOptions = {
		contractAddress: ContractAddressesInfo.KYC_ADDRESS,
		functionName: "isValid",
		abi: KYCInfo.abi,
		params: {
			userAddress: Moralis.User.current().get('ethAddress')
		}
	};

	await Moralis.executeFunction(kycOptions).then(async (result) => {
			console.log('KYCUserIsValid result', result);
			if (isValidAccountId(result)) {
				IsValidKYC = true;
				return;
			} else {
				console.log('KYCUser is invalid', result);
				document.getElementById('not_kyc_verified').style.display = 'block';
			}
		}).catch(function (error) {
console.log(error);
			if (error.message.indexOf('Address is not KYC valid') != -1) {
				document.getElementById('not_kyc_verified').style.display = 'block';
				document.getElementById('not_kyc_verified').addEventListener('click', function(evt) {
					evt.preventDefault();
					render('kyc', null, initKYC)
				})
			}


		});

}


