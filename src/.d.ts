// In a `.d.ts` file within the included folders of your project
import Moralis from 'Moralis';

declare global {
    export const Moralis : Moralis;
    export const ExecuteFunctionCallResult: Moralis.ExecuteFunctionCallResult;
    export const ethereum: any;
}

