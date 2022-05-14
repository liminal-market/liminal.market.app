import Moralis from "Moralis";
import NetworkInfo from "../../../networks/NetworkInfo";
import UserService from "../../../services/backend/UserService";
import AuthenticateService from "../../../services/backend/AuthenticateService";
import ConnectWallet from "../../modals/ConnectWallet";
import KYCService from "../../../services/blockchain/KYCService";
import KYCForm from "../../modals/KYCForm";
import AUSDService from "../../../services/blockchain/AUSDService";
import AUSDFund from "../../modals/AUSDFund";
import SecurityTokenService from "../../../services/blockchain/SecurityTokenService";
import LiminalMarketService from "../../../services/blockchain/LiminalMarketService";
import {AddressZero, roundNumberDecimal, shortEth} from "../../../util/Helper";
import Subscription from "../../../services/backend/Subscription";
import {TradeType} from '../../../enums/TradeType';
import TradePanelInput from "./TradePanelInput";
import ExecuteTradeButtonHtml from '../../../html/elements/tradepanel/ExecuteTradeButton.html';
import ProviderInfo from "../../../wallet/ProviderInfo";
import TradeExecutedHtml from '../../../html/elements/tradepanel/TradeExecuted.html'
import Modal from "../../modals/Modal";
import WalletHelper from "../../../util/WalletHelper";
import BlockchainError from "../../../errors/BlockchainError";
import NativeTokenNeeded from "../../modals/NativeTokenNeeded";

export default class ExecuteTradeButton {
    moralis: typeof Moralis;
    authenticateService: AuthenticateService;
    sellTradeInput: TradePanelInput;
    buyTradeInput: TradePanelInput;
    template: any;

    constructor(moralis: typeof Moralis, sellTradeInput: TradePanelInput, buyTradeInput: TradePanelInput) {
        this.moralis = moralis;
        this.sellTradeInput = sellTradeInput;
        this.buyTradeInput = buyTradeInput;
        this.authenticateService = new AuthenticateService(this.moralis);
        this.template = Handlebars.compile(ExecuteTradeButtonHtml);
    }

    public async renderButton() {
        let htmlButton = this.template();

        let button = document.getElementById('liminal_market_execute_trade')
        if (!button) return;
        button.outerHTML = htmlButton;
        button = document.getElementById('liminal_market_execute_trade')!;

        //this.removeClickEvent(button);
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

        if (!this.hasQuantityAndSymbol(button)) {
            return;
        }

        if (!await this.isMarketOpen(button)) {
            return;
        }

        this.enableExecuteTrade(button);
    }

    private enableExecuteTrade(button: HTMLElement) {
        //if (this.sellTradeInput.quantity.eq(0)) return;

        //execute trade can be done
        button.innerHTML = 'Execute trade';
        button.classList.replace('disabled', 'enabled');
        this.stopLoadingButton(button);

        button.addEventListener('click', async () => {
            this.loadingButton(button);
            let providerInfo = ProviderInfo.Instance;
            button.innerHTML = 'Confirm transaction in your ' + providerInfo.WalletName + ' wallet';

            if (this.sellTradeInput.symbol == 'aUSD') {
                let liminalMarketService = new LiminalMarketService(this.moralis);
                let symbolAddress = await liminalMarketService.getSymbolContractAddress(this.buyTradeInput.symbol);

                if (symbolAddress === AddressZero) {
                    let result = await liminalMarketService.createToken(this.buyTradeInput.symbol, () => {
                        button.innerHTML = 'Creating token. Give it few seconds';
                    })
                        .finally(() => {
                            this.stopLoadingButton(button);
                            button.innerHTML = 'Execute trade';
                        });
                    if (result instanceof BlockchainError) return;
                    symbolAddress = result as string;
                }

                let aUsdService = new AUSDService(this.moralis);
                await aUsdService.transfer(symbolAddress, this.sellTradeInput.quantity)
                    .catch(reason => {
                        console.log('CATCH - aUsdService.transfer', reason);
                    }).then(transaction => {
                        if (!transaction) return;

                        this.monitorExecuteTrade(transaction as Moralis.ExecuteFunctionResult, TradeType.Buy);
                        console.log('THEN - aUsdService.transfer', transaction);
                    }).finally(() => {
                        this.stopLoadingButton(button);
                        button.innerHTML = 'Execute trade';
                    });
            } else {
                let liminalMarketService = new LiminalMarketService(this.moralis);
                let symbolAddress = await liminalMarketService.getSymbolContractAddress(this.sellTradeInput.symbol);

                let securityTokenService = new SecurityTokenService(this.moralis);
                await securityTokenService.transfer(symbolAddress, this.sellTradeInput.quantity)
                    .catch(reason => {
                        console.log('CATCH - securityTokenService.transfer', reason);
                    })
                    .then(transaction => {
                        console.log('THEN - securityTokenService.transfer', transaction);
                        if (!transaction) return;

                        this.monitorExecuteTrade(transaction as Moralis.ExecuteFunctionResult, TradeType.Sell);
                    }).finally(() => {
                        this.stopLoadingButton(button);
                        button.innerHTML = 'Execute trade';
                    });
            }
        })
    }

    public async showTradeExecuted(object: any) {
        let proverInfo = ProviderInfo.Instance;
        let networkInfo = NetworkInfo.getInstance();

        let ethAddress = (object.userAddress) ? object.userAddress : object.sender;
        let tokenAddress = (object.tokenAddress) ? object.tokenAddress : object.recipient;
        let buyingQuantity = (object.userAddress) ? object.filledQty + ' shares' : '$' + object.filledQty;
        let obj: any = {
            sellingLogo: '/img/logos/' + this.sellTradeInput.symbol + '.png',
            sellingSymbol: this.sellTradeInput.symbol,
            sellingAmount: this.sellTradeInput.quantityFormatted(),
            buyingLogo: '/img/logos/' + this.buyTradeInput.symbol + '.png',
            buyingSymbol: this.buyTradeInput.symbol,
            buyingQuantity: buyingQuantity,
            buyingRoundQuantity: roundNumberDecimal(object.filledQty, 6),
            walletName: proverInfo.WalletName,
            shortEthAddress: shortEth(ethAddress),
            blockExplorerLink: networkInfo.BlockExplorer + '/tx/' + object.transaction_hash,
            tokenAddress: tokenAddress
        }
        let template = Handlebars.compile(TradeExecutedHtml);
        let content = template(obj);
        let modal = new Modal();
        modal.showModal('Trade executed', content);

        let addTokenToWallet = document.getElementById('addTokenToWallet');
        if (!addTokenToWallet) return;

        addTokenToWallet.addEventListener('click', (evt) => {

            let address = (evt.target as HTMLElement).dataset.address as string;
            let walletHelper = new WalletHelper(this.moralis);
            walletHelper.addTokenToWallet(address, this.buyTradeInput.symbol, () => {
                let addTokenToWalletFailed = document.getElementById('addTokenToWalletFailed');
                if (!addTokenToWalletFailed) return;

                addTokenToWalletFailed.classList.remove('d-none');
            })
        })
    }

    public async monitorExecuteTrade(transaction: Moralis.ExecuteFunctionResult, tradeType: TradeType) {
        let subscription = new Subscription(this.moralis);

        await subscription.subscribeToTable(tradeType, (object) => {
            if (object.status == 'order_filled') {
                this.showTradeExecuted(object);

                let executingTrade = document.getElementById('executing-trade-progress');
                if (!executingTrade) return;

                executingTrade.classList.add('d-none');
            }
        });

        let executingTrade = document.getElementById('executing-trade-progress');
        if (!executingTrade) return;

        executingTrade.classList.remove('d-none');
    }

    private loadingButton(button: HTMLElement) {
        button.setAttribute('aria-busy', 'true');
    }

    private stopLoadingButton(button: HTMLElement) {
        button.removeAttribute('aria-busy');
    }

    private walletIsConnected(button: HTMLElement) {
        let walletConnected = this.authenticateService.isWalletConnected();
        if (walletConnected) return true;
        this.removeClickEvent(button);
        button.innerHTML = 'Connect wallet';
        button.addEventListener('click', () => {
            let connectWallet = new ConnectWallet(this.moralis);
            connectWallet.chooseWalletProvider();
        });
        this.stopLoadingButton(button);
        return false;
    }

    private userIsLoggedIn(button: HTMLElement) {
        let userLoggedIn = this.authenticateService.isUserLoggedIn();
        if (userLoggedIn) return true;

        button.innerHTML = 'Login';
        button.addEventListener('click', async () => {
            await this.authenticateService.authenticateUser(ConnectWallet.Provider);
        });
        this.stopLoadingButton(button);
        return false;
    }

    private chainIdIsCorrect(button: HTMLElement) {
        let chainId = this.authenticateService.getChainId();
        let networkInfo = NetworkInfo.getInstance();
        if (chainId === networkInfo.ChainId) return true;

        let usersWalletNetwork = NetworkInfo.getNetworkInfoByChainId(chainId);
        if (usersWalletNetwork) {
            NetworkInfo.setNetworkByChainId(chainId);
            return true;
        }

        button.innerHTML = 'Switch Network';
        button.addEventListener('click', async () => {
            await networkInfo.addNetworkToWallet(this.moralis);
        })
        this.stopLoadingButton(button);
        return false;

    }

    private async userHasNativeToken(button: HTMLElement): Promise<boolean> {
        let networkInfo = NetworkInfo.getInstance();
        let hasEnoughNativeTokens = await networkInfo.hasEnoughNativeTokens(this.moralis);
        if (hasEnoughNativeTokens) return true;

        button.classList.replace('enabled', 'disabled');

        button.innerHTML = 'You need ' + networkInfo.NativeCurrencyName + ' tokens. Click me for some tokens';
        button.addEventListener('click', () => {
            let nativeTokenNeededModal = new NativeTokenNeeded(this.moralis, () => {
                this.renderButton();
            });
            nativeTokenNeededModal.show()
        });

        this.stopLoadingButton(button);
        return false;

    }

    private async kycIsDone(button: HTMLElement) {
        let kycService = new KYCService(this.moralis);
        let ethAddress = this.authenticateService.getEthAddress();
        if (ethAddress === '') {
            console.log('no ETH address, kyc check failed')
            return false;
        }

        let hasValidKYC = await kycService.hasValidKYC(ethAddress);
        if (hasValidKYC) return true;

        button.innerHTML = 'Finish KYC';
        button.addEventListener('click', () => {
            let kycForm = new KYCForm(() => {
                this.renderButton();
            });
            kycForm.showKYCForm();
        });
        this.stopLoadingButton(button);
        return false;
    }

    private async userHasAUSD(button: HTMLElement): Promise<boolean> {
        let ausdService = new AUSDService(this.moralis);
        let balance = await ausdService.getAUSDBalanceOf(this.authenticateService.getEthAddress());
        if (balance.isGreaterThan(0)) return true;

        let networkInfo = NetworkInfo.getInstance();
        if (networkInfo.TestNetwork) {
            button.innerHTML = 'You need aUSD. Click here to get some';
            button.addEventListener('click', () => {
                let ausdFund = new AUSDFund(this.moralis);
                ausdFund.showAUSDFakeFund(() => {
                    this.renderButton();
                })
            });
        } else {
            button.innerHTML = 'You need aUSD. Click here for instructions';
            button.addEventListener('click', () => {
                let ausdFund = new AUSDFund(this.moralis);
                ausdFund.showAUSDFund(() => {
                    this.renderButton();
                });
            });
        }
        this.stopLoadingButton(button);
        return false;

    }

    private async userHasEnoughQty(button: HTMLElement) {

        let ausdService = new AUSDService(this.moralis);
        if (this.sellTradeInput.symbol == 'aUSD') {
            let balance = await ausdService.getAUSDBalanceOf(this.authenticateService.getEthAddress());
            if (balance.isGreaterThanOrEqualTo(this.sellTradeInput.quantity)) return true;

            button.innerHTML = "You don't have enough aUSD. Click for more funding";
            button.addEventListener('click', () => {
                let networkInfo = NetworkInfo.getInstance();
                let ausdFund = new AUSDFund(this.moralis);
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

            let userQuantity = await securityTokenService.getQuantityByAddress(this.sellTradeInput.symbol, ethAddress);
            if (this.sellTradeInput.quantity <= userQuantity) return true;

            button.innerHTML = "You don't have enough " + this.sellTradeInput.symbol;
            button.classList.replace('disable', 'enable');
        }
        this.stopLoadingButton(button);
        return false;
    }

    private async isMarketOpen(button: HTMLElement): Promise<boolean> {
        let userService = new UserService(this.moralis);
        let isMarketOpen = await userService.isMarketOpenOrUserOffHours();
        if (isMarketOpen) return true;

        button.innerHTML = 'Market is closed'
        button.classList.replace('enabled', 'disabled');

        this.stopLoadingButton(button);

        return false;
    }

    private removeClickEvent(button: HTMLElement) {
        let f = (event: any) => button.onclick ? (event) : undefined;

        if (f) {
            button.removeEventListener('click', f);
        }
    }

    private hasQuantityAndSymbol(button: HTMLElement) {
        if (this.sellTradeInput.quantity.eq(0)) {
            button.innerHTML = 'Type in quantity';
            this.stopLoadingButton(button);
            return false;
        }

        if (this.buyTradeInput.name == '') {
            button.innerHTML = 'Select stock to buy';
            this.stopLoadingButton(button);
            return false;
        }
        return true;
    }
}