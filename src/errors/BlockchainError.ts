import GeneralError from "./GeneralError";

export default class BlockchainError extends GeneralError {
    static UserCancelled = 1;
    static AddressIsNotValidKYC = 2;

    constructor(e : any) {
        super(e);
        if (this.userDeniedTransactionSignature()) {
            this.code = BlockchainError.UserCancelled;
        } else if (this.addressIsNotValidKYC()) {
            this.code = BlockchainError.AddressIsNotValidKYC;
        }
    }

    public userDeniedTransactionSignature() {
        return this.message.indexOf('denied transaction signature') !== -1;
    }

    public addressIsNotValidKYC() {
        return this.message.indexOf('address is not kyc valid') === -1;
    }
}