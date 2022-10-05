export default class KycResultMessage {
    type: string;
    key: string;
    message: string;

    constructor(type: string, key: string, message: string) {
        this.type = type;
        this.key = key;
        this.message = message;
    }

}