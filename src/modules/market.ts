import {ExecuteTradeOffHoursTxt} from './buy';
import Moralis from 'moralis';

export let IsMarketOpen  = false;
export let UserIsOffHours = false;
export const isMarketOpen = async function () {
	let user = Moralis.User.current();
	if (!user) return;

	if (user) {
		UserIsOffHours = user.get('offHours');
	}
console.log('UserIsOffHours:', UserIsOffHours);
	if (!UserIsOffHours) {
		IsMarketOpen = await Moralis.Cloud.run('isOpen');
		if (!IsMarketOpen) {
			document.getElementById('offHours').style.display = "block";
		} else {
			document.getElementById('offHours').style.display = "none";
		}
	} else {
		IsMarketOpen = true;
		(document.getElementById('enableOffHours') as HTMLInputElement).checked = true;
	}

	document.getElementById('enableOffHours').addEventListener('click', function (e : Event) {

		let input = e.target as HTMLInputElement;
		user.set('offHours', input.checked); // do stuff with your user
		user.save();

		if (!document.getElementById('execute-trade')) return;

		if (input.checked) {
			document.getElementById('execute-trade').innerHTML = "Execute trade";
		} else {
			document.getElementById('execute-trade').innerHTML = ExecuteTradeOffHoursTxt;
		}


	})
}