import KYCService from "../services/blockchain/KYCService";
import NetworkInfo from "../networks/NetworkInfo";
import Progress from "../ui/elements/Progress";


export const initKYC = async function () {
	let user = Moralis.User.current();
	if (!user) return;

	let alpacaId = (await user.fetch()).get('alpacaId');

	let kycService = new KYCService(Moralis);
	if (kycService.isValidAccountId(alpacaId)) {
		kycIsDone();
		return;
	}

	let ethAddress = user.get('ethAddress');
	let hasValidKyc = await kycService.hasValidKYC(ethAddress);
	if (hasValidKyc) {
		kycIsDone();
		return;
	}
	document.getElementById('kyc_reg')!.style.display='block';
	document.getElementById('submitKYC')!.onclick = submitKYC;

	let networkInfo = NetworkInfo.getInstance();
	if (networkInfo.TestNetwork) {
		loadName();
	}
}

const kycIsDone= function() {
	//kycIsDone
}


const submitKYC = async function () {
	let progress = new Progress();
	progress.show('Register KYC with broker', 33, false, ['submitKYC']);

	const form = document.getElementById('kyc_wizard_form') as HTMLFormElement;
	let data = new FormData(form);
	let params = serialize(data);

	let kycService = new KYCService(Moralis);
	await kycService.saveKYCInfo(params);

	return false;
}

function serialize(data : any) {
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


const loadName = function() {
	let characters = [
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
	let character = characters[idx];
	(document.getElementById('given_name') as HTMLInputElement).value = character.given_name;
	(document.getElementById('family_name') as HTMLInputElement).value = character.family_name;
	(document.getElementById('email_address') as HTMLInputElement).value = character.email_address + '.' + (new Date().getTime()) + '@parks-and-rec-example.com';

}