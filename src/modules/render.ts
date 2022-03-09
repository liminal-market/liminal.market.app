import Moralis from "moralis";
import { errorHandler } from "./error";

export const renderWithMoralis = async function(moralisFunction : string, params : string, templateName : string, initFunc, containerId? : string) {

	try {
		let moralisResponse = await Moralis.Cloud.run(moralisFunction, params);
		render(templateName, moralisResponse, initFunc, containerId);
	} catch (e) {
		errorHandler(e);
		render(templateName, null, initFunc);
	}
}

export const render = async function(templateName : string, moralisResponse : string, initFunc : () => void, containerId? : string) {
	try {
		if (!containerId) containerId = 'main_container';

		registerHelpers();

		await fetch('/templates/' + templateName + '.html')
			.then(response => response.text())
			.then(text => {
				let template = Handlebars.compile(text);
				let html = template({ result : moralisResponse });
				document.getElementById(containerId).innerHTML = html;

				if (initFunc) initFunc();
			});
	} catch (e) {
		errorHandler(e);
	}
}

export const registerHelpers = function() {
	Handlebars.registerHelper('perc', function (number : string) {
		return Math.round(parseFloat(number) * 10000) / 100 + '%';
	});
	Handlebars.registerHelper('round', function (number : string) {
		return Math.round(parseFloat(number) * 100) / 100;
	});

	Handlebars.registerHelper('round2', function (number : string) {
		return Math.round(parseFloat(number) * 10000) / 10000;
	});
	Handlebars.registerHelper('classColor', function (number : number) {
		return (number > 0) ? "green" : "red";
	});
}
