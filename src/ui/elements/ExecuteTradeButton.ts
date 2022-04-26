import Moralis from "Moralis";
import NetworkInfo from "../../networks/NetworkInfo";
import UserService from "../../services/backend/UserService";
import AuthenticateService from "../../services/backend/AuthenticateService";
import ConnectWallet from "../modals/ConnectWallet";
import KYCService from "../../services/blockchain/KYCService";
import KYCForm from "../modals/KYCForm";
import AUSDService from "../../services/blockchain/AUSDService";
import AUSDFund from "../modals/AUSDFund";
import SecurityTokenService from "../../services/blockchain/SecurityTokenService";
import LiminalMarketService from "../../services/blockchain/LiminalMarketService";
import {AddressZero} from "../../util/Helper";

export default class ExecuteTradeButton {
    moralis : typeof Moralis;
    authenticateService : AuthenticateService;
    symbol : string;
    qty : number;
    tradeType : TradeType

    constructor(moralis : typeof Moralis, symbol : string, qty : number, tradeType : TradeType) {
        this.moralis = moralis;
        this.authenticateService = new AuthenticateService(this.moralis);
        this.symbol = symbol;
        this.qty = qty;
        this.tradeType = tradeType;
    }

    public async renderButton() {
        let button = document.getElementById('execute-trade');
        if (!button || this.qty === 0) return;

        this.loadingButton(button);

        //wallet connected
        if (!this.walletIsConnected(button)) {
            return;
        }
        //user logged in
        if (!this.userIsLoggedIn(button)) {
            return;
        }
        //chain id correct
        if (!this.chainIdIsCorrect(button)) {
            return;
        }
        //native token is available
        if (!await this.userHasNativeToken(button)) {
            return;
        }
        //kyc is done
        if (!await this.kycIsDone(button)) {
            return;
        }
        //ausd is setup
        if (!await this.userHasAUSD(button)) {
            return;
        }

        //ausd > buy amount
        if (!await this.userHasEnoughQty(button)) {
            return;
        }

        if (!await this.isMarketOpen(button)) {
            return;
        }

        this.enableExecuteTrade(button);
    }

    private enableExecuteTrade(button: HTMLElement) {

        //execute trade can be done
        button.innerHTML = 'Execute trade';
        button.classList.replace('disabled', 'enabled');
        button.addEventListener('click', async (evt) => {
            this.loadingButton(button);

            if (this.tradeType == TradeType.aUSD) {
                let liminalMarketService = new LiminalMarketService(this.moralis);
                let symbolAddress = await liminalMarketService.getSymbolContractAddress(this.symbol);

                if (symbolAddress === AddressZero) {
                    symbolAddress = await liminalMarketService.createToken(this.symbol);
                }

                let aUsdService = new AUSDService(this.moralis);
                await aUsdService.transfer(symbolAddress, this.qty);
            } else {
                let liminalMarketService = new LiminalMarketService(this.moralis);
                let symbolAddress = await liminalMarketService.getSymbolContractAddress(this.symbol);

                let securityTokenService = new SecurityTokenService(this.moralis);
                await securityTokenService.transfer(symbolAddress, this.qty);
            }
        })
    }

    private loadingButton(button : HTMLElement) {
        button.classList.replace('enabled', 'disabled')
        button.innerHTML = '/img/loader.gif';
    }


    private walletIsConnected(button : HTMLElement) {
        let walletConnected = this.authenticateService.isWalletConnected();
        if (walletConnected) return true;

        button.innerHTML = 'Connect wallet';
        button.addEventListener('click', (evt) => {
            let connectWallet = new ConnectWallet(this.moralis);
            connectWallet.chooseWalletProvider(async () => {
                await this.renderButton();
            });
        });
        return false;
    }
    private userIsLoggedIn(button : HTMLElement) {
         let userLoggedIn = this.authenticateService.isUserLoggedIn();
         if (userLoggedIn) return true;

        button.innerHTML = 'Login';
        button.addEventListener('click', async (evt) => {
            await this.authenticateService.authenticateUser(ConnectWallet.Provider);
        });
        return false;
    }
    private chainIdIsCorrect(button : HTMLElement) {
        let chainId = this.authenticateService.getChainId();
        let networkInfo = NetworkInfo.getInstance();
        if (chainId === networkInfo.ChainId.toString()) return true;

        button.innerHTML = 'Switch Network';
        button.addEventListener('click', async (evt) => {
            await networkInfo.addNetworkToWallet(this.moralis);
        })

    }
    private async userHasNativeToken(button : HTMLElement) : Promise<boolean> {
        let networkInfo = NetworkInfo.getInstance();
        let hasEnoughNativeTokens = await networkInfo.hasEnoughNativeTokens(this.moralis);
        if (hasEnoughNativeTokens) return true;

        button.classList.replace('enabled', 'disabled');
        if (networkInfo.TestNetwork) {
            button.innerHTML = 'You need ' + networkInfo.NativeCurrencyName + ' tokens. Click me for some tokens';
            button.addEventListener('click', (evt) => {
                window.open('https://faucet.polygon.technology/', '_blank');
            });
        } else {
            button.innerHTML = 'You need ' + networkInfo.NativeCurrencyName + ' tokens. Click me to buy some';
            button.addEventListener('click', (evt) => {
                window.open('https://www.moonpay.com/buy/matic', '_blank');
            });
        }
        return false;

    }
    private async kycIsDone(button : HTMLElement) {
        let kycService = new KYCService(this.moralis);
        let ethAddress = this.authenticateService.getEthAddress();
        if (ethAddress === '') return false;

        let hasValidKYC = await kycService.hasValidKYC(ethAddress);
        if (hasValidKYC) return true;

        button.innerHTML = 'Finish KYC';
        button.addEventListener('click', (evt) => {
            let kycForm = new KYCForm();
            kycForm.showKYCForm(() => {
                this.renderButton();
            });
        });
        return false;
    }
    private async userHasAUSD(button : HTMLElement) : Promise<boolean> {
        let ausdService = new AUSDService(this.moralis);
        let balance = await ausdService.getAUSDBalanceOf(this.authenticateService.getEthAddress());
        if (balance !== 0) return true;

        let networkInfo = NetworkInfo.getInstance();
        if (networkInfo.TestNetwork) {
            button.innerHTML = 'You need aUSD. Click here to get some';
            button.addEventListener('click', (evt) => {
                let ausdFund = new AUSDFund();
                ausdFund.showAUSDFakeFund(() => {
                    this.renderButton();
                })
            });
        } else {
            button.innerHTML = 'You need aUSD. Click here for instructions';
            button.addEventListener('click', (evt) => {
                let ausdFund = new AUSDFund();
                ausdFund.showAUSDFund(() => {
                    this.renderButton();
                });
            });
        }
        return false;

    }

    private async userHasEnoughQty(button: HTMLElement) {

        let ausdService = new AUSDService(this.moralis);
        if (this.tradeType == TradeType.aUSD) {
            let balance = await ausdService.getAUSDBalanceOf(this.authenticateService.getEthAddress());
            if (balance >= this.qty) return true;

            button.innerHTML = "You don't have enough aUSD. Click for more funding";
            button.addEventListener('click', (evt) => {
                let networkInfo = NetworkInfo.getInstance();
                let ausdFund = new AUSDFund();
                if (networkInfo.TestNetwork) {

                    ausdFund.showAUSDFakeFund(() => {
                        this.renderButton();
                    });
                } else {
                    ausdFund.showAUSDFund(() => {
                        this.renderButton();
                    })
                }
            })
        } else {
            let securityTokenService = new SecurityTokenService(this.moralis);
            let authenticateService = new AuthenticateService(this.moralis);
            let ethAddress = authenticateService.getEthAddress();

            let userQuantity = await securityTokenService.getQuantityByAddress(this.symbol, ethAddress);
            if (this.qty <= userQuantity) return true;

            button.innerHTML = "You don't have enough " + this.symbol;
            button.classList.replace('disable', 'enable');
        }

    }

    private async isMarketOpen(button: HTMLElement) : Promise<boolean> {
        let userService = new UserService(this.moralis);
        let isMarketOpen = await userService.isMarketOpenOrUserOffHours();

        if (!isMarketOpen) {
            button.classList.replace('enabled', 'disabled');
        }
        return true;
    }
}