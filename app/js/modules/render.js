import { errorHandler } from "./error.js";

export const renderWithMoralis = async function(moralisFunction, params, templateName, initFunc, containerId) {

	try {
		let moralisResponse = await Moralis.Cloud.run(moralisFunction, params);
		render(templateName, moralisResponse, initFunc, containerId);
	} catch (e) {
		errorHandler(e);
		render(templateName, null, initFunc);
	}
}

export const render = async function(templateName, moralisResponse, initFunc, containerId) {
	try {
		if (!containerId) containerId = 'main_container';

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