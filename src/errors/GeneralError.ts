export default class GeneralError extends Error {
    code : number;
    message : string;
    headers : any;
    error : any;
    stack : string;
    callback? : () => void;

    constructor(e : any) {
        super();
        this.code = 0;
        this.stack = "";
        if (!e.message) {
            this.message = e.toString();
        } else if (e.message.data) {
            this.code = e.message.data.code;
            this.message = e.message.data.message;
            this.error = e;
            this.headers = e.message.headers;
            this.stack = e.stack;
        } else if (typeof(e.data) == 'object') {
            this.code = e.data.code;
            this.message = e.data.message;
            this.stack = e.stack;
        } else if (e.message) {
            this.message = e.message;
        } else {
            this.message = e.toString();
        }
    }
}