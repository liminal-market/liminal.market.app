export const isMarketOpen = async function () {
	let user = Moralis.User.current();
	if (!user) return;

	let offHours = false;
	if (user) {
		offHours = user.get('offHours');
	}

	if (!offHours) {
		let result = await Moralis.Cloud.run('isOpen');
		if (!result) {
			document.getElementById('closedMarket').style.display = 'block';
			document.getElementById('offHours').style.display = "block";
		} else {
			document.getElementById('closedMarket').style.display = 'none';
			document.getElementById('offHours').style.display = "none";
		}
	} else {
		document.getElementById('enableOffHours').checked = true;
	}

	document.getElementById('enableOffHours').addEventListener('click', function (e) {

		let input = e.target;
		Moralis.Cloud.run('offHours', {
			offHours: input.checked
		});

		Moralis.User.currentAsync().then(function (user) {
			user.set('offHours', input.checked); // do stuff with your user
		});
	})
}