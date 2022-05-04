import {errorHandler} from "../errors/error";

export default class Render {
	moralis : typeof Moralis;

	constructor(moralis : typeof Moralis) {
		this.moralis = moralis;
	}

	public async renderWithMoralis(moralisFunction: string, params: string, templateName: string, initFunc : () => void, containerId?: string) {

		try {
			let moralisResponse = await this.moralis.Cloud.run(moralisFunction, params);
			await this.render(templateName, moralisResponse, initFunc, containerId);
		} catch (e : any) {
			errorHandler(e).then();
			await this.render(templateName, '', initFunc);
		}
	}

	public async render(templateName: string, moralisResponse: string, initFunc: () => void, containerId?: string) {
		try {
			if (!containerId) containerId = 'main_container';

			this.registerHelpers();

			await fetch('templates/' + templateName + '.html')
				.then(response => response.text())
				.then(text => {
					let template = Handlebars.compile(text);
					document.getElementById(containerId!)!.innerHTML = template({result: moralisResponse});
					window.scrollTo(0, 0);
					if (initFunc) initFunc();
				});
		} catch (e : any) {
			errorHandler(e).then();
		}
	}

	public registerHelpers() {
		Handlebars.registerHelper('perc', function (number: string) {
			return Math.round(parseFloat(number) * 10000) / 100 + '%';
		});
		Handlebars.registerHelper('round', function (number: string) {
			return Math.round(parseFloat(number) * 100) / 100;
		});

		Handlebars.registerHelper('round2', function (number: string) {
			return Math.round(parseFloat(number) * 10000) / 10000;
		});
		Handlebars.registerHelper('classColor', function (number: number) {
			return (number > 0) ? "green" : "red";
		});
	}

}
