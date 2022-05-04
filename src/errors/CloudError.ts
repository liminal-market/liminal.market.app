export default class CloudError {
    code : number;
    message : string;
    headers : any;
    error : any;
    stack : string;
    constructor(e : any) {
        this.code = e.message.data.code;
        this.message = e.message.data.message;
        this.error = e;
        this.headers = e.message.headers;
        this.stack = e.stack;
    }
}