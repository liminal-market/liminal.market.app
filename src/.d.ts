// In a `.d.ts` file within the included folders of your project
import Handlebars from "handlebars";

declare global {
    export const ethereum: any;
      // @ts-ignore
    export const Handlebars: Handlebars;
    export const Plaid: any;
}

