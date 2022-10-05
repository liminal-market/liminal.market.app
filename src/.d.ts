// In a `.d.ts` file within the included folders of your project
import Moralis from 'Moralis';
import Handlebars from "handlebars";

declare global {
    export const Moralis : Moralis;
    export const ExecuteFunctionCallResult: Moralis.ExecuteFunctionCallResult;
    export const ethereum: any;
      // @ts-ignore
    export const Handlebars: Handlebars;
}

