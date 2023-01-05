// In a `.d.ts` file within the included folders of your project
import Handlebars from "handlebars";

declare global {
      // @ts-ignore
    export const Handlebars: Handlebars;
}

