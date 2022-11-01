import Moralis from "Moralis";
import NetworkInfo from "../../../networks/NetworkInfo";
import UserService from "../../../services/backend/UserService";
import AuthenticateService from "../../../services/backend/AuthenticateService";
import ConnectWallet from "../../modals/ConnectWallet";
import KYCService from "../../../services/blockchain/KYCService";
import AUSDService from "../../../services/blockchain/AUSDService";
import FakeAUSDFund from "../../modals/Funding/FakeAUSDFund";
import SecurityTokenService from "../../../services/blockchain/SecurityTokenService";
import LiminalMarketService from "../../../services/blockchain/LiminalMarketService";
import {AddressZero, roundBigNumberDecimal, roundNumberDecimal, shortEth} from "../../../util/Helper";
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
import BigNumber from "bignumber.js";
import KycStatusHandler from "../../modals/KYC/KycStatusHandler";
import KycApprovedHtml from '../../../html/modal/Kyc/KycApproved.html';
import AUsdBalance from "../AUsdBalance";


export default class ExecuteTradeButton {
    moralis: typeof Moralis;
    authenticateService: AuthenticateService;
    sellTradeInput: TradePanelInput;
    buyTradeInput: TradePanelInput;
    template: any;
    button: HTMLInputElement;

    static Instance: ExecuteTradeButton;
    constructor(moralis: typeof Moralis, sellTradeInput: TradePanelInput, buyTradeInput: TradePanelInput) {
        this.moralis = moralis;
        this.sellTradeInput = sellTradeInput;
        this.buyTradeInput = buyTradeInput;
        this.authenticateService = new AuthenticateService(this.moralis);
        this.template = Handlebars.compile(ExecuteTradeButtonHtml);
        this.button = document.getElementById('liminal_market_execute_trade') as HTMLInputElement;

        ExecuteTradeButton.Instance = this;
    }

    public async renderButton() {
        this.button = document.getElementById('liminal_market_execute_trade') as HTMLInputElement;
        //this.button.replaceWith(this.button.cloneNode(true));
        // document.getElementById('liminal_market_execute_trade')!.outerHTML = this.button.outerHTML;

        this.loadingButton(this.button);

        //wallet connected
        if (!this.walletIsConnected(this.button)) {
            return;
        }
        //user logged in
        if (!this.userIsLoggedIn(this.button)) {
            return;
        }
        //chain id correct
        if (!this.chainIdIsCorrect(this.button)) {
            return;
        }
        //native token is available
        if (!await this.userHasNativeToken(this.button)) {
            return;
        }
        //kyc is done
        if (!await this.kycIsDone(this.button)) {
            return;
        }
        //ausd is setup
        if (!await this.userHasAUSD(this.button)) {
            return;
        }

        //ausd > buy amount
        if (!await this.userHasEnoughQty(this.button)) {
            return;
        }

        if (!this.hasQuantityAndSymbol(this.button)) {
            return;
        }

        if (!await this.isMarketOpen(this.button)) {
            return;
        }

        this.enableExecuteTrade(this.button);
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
                    }).finally(() => {
                        this.stopLoadingButton(button);
                        button.innerHTML = 'Execute trade';
                    });
                    if (result instanceof BlockchainError) return;
                    symbolAddress = result as string;
                }

                await this.executeTransfer(symbolAddress, button);
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

    private async executeTransfer(symbolAddress: string, button: HTMLElement) {
        let aUsdService = new AUSDService(this.moralis);
        await aUsdService.transfer(symbolAddress, this.sellTradeInput.quantity)
            .catch(reason => {
                console.log('CATCH - aUsdService.transfer', reason);
            }).then(transaction => {
                if (!transaction) return;

                this.monitorExecuteTrade(transaction as Moralis.ExecuteFunctionResult, TradeType.Buy);
                this.setProgressText('Sending to blockchain', transaction.hash)

            }).finally(() => {
                this.stopLoadingButton(button);
                button.innerHTML = 'Execute trade';
            });
    }

    public getBuyingSharesObj(object: any): any {
        let ethAddress = object.walletAddress;
        let tokenAddress = object.tokenAddress;
        let buyingQuantity = object.filled_qty;
        let sellingAmount = '$' + new BigNumber(object.amount).div(10 ** 18).toFixed();

        return {
            sellingLogo: '/img/logos/aUSD.png',
            sellingSymbol: 'aUSD',
            sellingAmount: sellingAmount,
            buyingLogo: '/img/logos/' + object.symbol + '.png',
            buyingSymbol: object.symbol,
            buyingQuantity: buyingQuantity,
            buyingRoundQuantity: roundNumberDecimal(buyingQuantity, 6) + ' shares',
            shortEthAddress: shortEth(ethAddress),
            tokenAddress: tokenAddress
        }
    }

    public getSellSharesObj(object: any): any {
        let ethAddress = object.sender;
        let tokenAddress = object.recipient;
        let buyingQuantity = new BigNumber(object.filled_avg_price).multipliedBy(new BigNumber(object.filled_qty))
        let sellingAmount = object.filled_qty;

        return {
            sellingLogo: '/img/logos/' + object.symbol + '.png',
            sellingSymbol: object.symbol,
            sellingAmount: sellingAmount + ' shares',
            buyingLogo: '/img/logos/aUSD.png',
            buyingSymbol: 'aUSD',
            buyingQuantity: buyingQuantity.toFixed(),
            buyingRoundQuantity: '$' + roundBigNumberDecimal(buyingQuantity, 6).toFixed(),
            shortEthAddress: shortEth(ethAddress),
            tokenAddress: tokenAddress
        }
    }

    public async showTradeExecuted(object: any) {
        let providerInfo = ProviderInfo.Instance;
        let networkInfo = NetworkInfo.getInstance();
        let isBuy = (object.side == 'buy');

        let obj = (isBuy) ? this.getBuyingSharesObj(object) : this.getSellSharesObj(object);
        obj.walletName = providerInfo.WalletName;
        obj.blockExplorerLink = networkInfo.BlockExplorer + '/tx/' + object.transaction_hash;

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

        await subscription.subscribeToTable(tradeType, async (object) => {
            let user = this.moralis.User.current();
            if (!user) return;
            if (object.walletAddress != user.get('ethAddress')) {
                console.log('obj.walletAddress:' + object.walletAddress + ' user:' + user.get('ethAddress'));
                return;
            }

            if (object.status == 'order_filled') {
                await this.showTradeExecuted(object);
                await AUsdBalance.forceLoadAUSDBalanceUI();

                let executingTrade = document.getElementById('executing-trade-progress');
                if (!executingTrade) return;

                executingTrade.classList.add('d-none');
            } else if (object.status == 'order_failed') {
                let modal = new Modal();
                modal.showModal('Order failed', 'We could not finish your order.')
            } else if (!object.status) {
                this.setProgressText('Received order sending to stock exchange', object.transaction_hash)
            } else if (object.status == 'order_requested') {
                this.setProgressText('Sent to stock exchange', object.transaction_hash);
                await AUsdBalance.forceLoadAUSDBalanceUI();
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

    kycIdDoneTimeout: any;

    private async kycIsDone(button: HTMLElement, intervalCheck = false) {
        let kycService = new KYCService(this.moralis);
        let ethAddress = this.authenticateService.getEthAddress();
        if (ethAddress === '') {
            console.log('no ETH address, kyc check failed')
            return false;
        }

        let kycResponse = await kycService.hasValidKYC();
        if (!kycResponse.isValidKyc && kycResponse.status == 'ACTIVE') {
            this.kycIdDoneTimeout = setInterval(async () => {
                kycResponse = await kycService.hasValidKYC();
                if (kycResponse.isValidKyc) {
                    this.hasBuyingPower = kycResponse.hasBuyingPower;
                    clearInterval(this.kycIdDoneTimeout);
                    await this.renderButton()
                }
            }, 10 * 1000)
        }

        if (kycResponse.isValidKyc) {

            if (intervalCheck) {
                clearInterval(this.kycIdDoneTimeout);

                let template = Handlebars.compile(KycApprovedHtml);
                let modal = new Modal();
                modal.showModal('Account approved', template({}));

                let fundAccount = document.getElementById('kycApprovedFund');
                fundAccount?.addEventListener('click', (evt) => {
                    modal.hideModal();

                    let ausdFund = new FakeAUSDFund(this.moralis);
                    ausdFund.showAUSDFakeFund(() => {
                        this.renderButton();
                    })
                })
            }
            return true;
        }

        let kycStatusHandler = new KycStatusHandler(kycResponse, this);

        button.innerHTML = kycStatusHandler.getButtonText();
        button.addEventListener('click', kycStatusHandler.getButtonClickEvent(this));
        this.stopLoadingButton(button);

        return false;
    }

    public checkKycIsDone() {
        if (this.kycIdDoneTimeout) return;

        this.kycIdDoneTimeout = setInterval(async () => {
            await this.kycIsDone(this.button, true);
        }, 10 * 1000);
    }

    checkBalanceInterval: any;
    hasBuyingPower = false;

    private async userHasAUSD(button: HTMLElement): Promise<boolean> {
        let ausdService = new AUSDService(this.moralis);
        let balance = await ausdService.getAUSDBalanceOf(this.authenticateService.getEthAddress());
        if (balance.isGreaterThan(0)) return true;

        if (this.hasBuyingPower) {
            button.innerHTML = 'We are funding you aUSD token';
            this.checkBalanceInterval = setInterval(async () => {
                AUSDService.lastUpdate = undefined;

                let balance = await ausdService.getAUSDBalanceOf(this.authenticateService.getEthAddress());
                if (balance.isGreaterThan(0)) {
                    await AUsdBalance.forceLoadAUSDBalanceUI();

                    clearInterval(this.checkBalanceInterval);
                    await this.renderButton();
                }
            }, 10 * 1000);

            return false;
        }
        let networkInfo = NetworkInfo.getInstance();
        if (networkInfo.TestNetwork) {
            button.innerHTML = 'You need aUSD. Click here to get some';
            button.addEventListener('click', () => {
                let ausdFund = new FakeAUSDFund(this.moralis);
                ausdFund.showAUSDFakeFund(() => {
                    this.renderButton();
                })
            });
        } else {
            button.innerHTML = 'You need aUSD. Click here for instructions';
            button.addEventListener('click', () => {
                let ausdFund = new FakeAUSDFund(this.moralis);
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
                let ausdFund = new FakeAUSDFund(this.moralis);
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

    private setProgressText(text: string, hash: string) {
        let progressText = document.getElementById('progress-text');
        if (progressText) {
            let networkInfo = NetworkInfo.getInstance();
            progressText.innerHTML = text + '<br /><a href="' + networkInfo.BlockExplorer + '/tx/' + hash + '" target="_blank" style="font-size:10px">View</a>';
        }
    }

}