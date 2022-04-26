import NetworkInfo from "../../networks/NetworkInfo";
import MarketService from "../broker/MarketService";

export default class UserService {
    moralis: typeof Moralis;

    constructor(moralis?: typeof Moralis) {
        if (!moralis) moralis = Moralis

        this.moralis = moralis;
    }

    async logIn() {
        try {

            let web3 = await this.moralis.enableWeb3();
            console.log('account', this.moralis.account)
            let user = this.moralis.User.current();
            if (user) return Promise.resolve(user);

            return this.moralis.authenticate();
        } catch (e) {
            console.log(e);
        }
    }

    public logOut() {
        return this.moralis.User.logOut();
    }

    public isLoggedIn(): typeof Moralis.User | undefined {
        if (!this.moralis.isWeb3Enabled()) return undefined;
        let user = this.moralis.User.current();
        if (!user) return undefined;
        return user;
    }

    public setOffHours(isOffHours: boolean): void {
        let user = this.moralis.User.current();
        if (!user) return;

        user.set('offHours', isOffHours); // do stuff with your user
        user.save();
    }

    public isOffHours() : boolean {
        let user = Moralis.User.current();
        if (!user) return false;

        return user.get('offHours') as boolean;
    }

    public async isMarketOpenOrUserOffHours() : Promise<boolean> {
        let marketService = new MarketService(this.moralis);
        let isOpen = await marketService.isMarketOpen();
        if (isOpen) return true;

        let networkInfo = NetworkInfo.getInstance();
        if (!networkInfo.TestNetwork) return false;

        let isOffHours = this.isOffHours();
        if (isOffHours) return true;

        return false;
    }
}