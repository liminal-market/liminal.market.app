import Moralis from "Moralis";


export default class AuthenticateResult {
    user? : Moralis.Attributes
    success : boolean;
    message? : string;

    constructor(success : boolean, user? : Moralis.Attributes, message? : string) {
        this.user = user;
        this.success = success;
        this.message = message;
    }

}