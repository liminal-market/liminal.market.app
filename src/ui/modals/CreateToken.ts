import Modal from "./Modal";
import CreateTokenHtml from '../../html/modal/CreateToken.html';
import LiminalMarketService from "../../services/blockchain/LiminalMarketService";
import WalletHelper from "../../util/WalletHelper";
import {AddressZero} from "../../util/Helper";
import LoadingHelper from "../../util/LoadingHelper";
import BlockchainError from "../../errors/BlockchainError";

export default class CreateToken {
    constructor() {
    }

    public show(symbol : string) {
        let modal = new Modal();

        let template = Handlebars.compile(CreateTokenHtml);


        modal.showModal("Token " + symbol + " doesn't exist", template({symbol:symbol}));

        let btn = document.getElementById('createTokenBtn') as HTMLElement;
        if (!btn) return;

        btn.addEventListener('click', async () => {
            LoadingHelper.setLoading(btn!);

            let liminalMarketService = new LiminalMarketService();
            let address = await liminalMarketService.getSymbolContractAddress(symbol);
            if (address === AddressZero) {
                let result = await liminalMarketService.createToken(symbol, () => {
                    btn.innerHTML = 'Creating token. Give it few seconds';
                });

                if (result instanceof BlockchainError && result.code == BlockchainError.UserCancelled) {
                    LoadingHelper.removeLoading();
                    return;
                }
                address = result as string;
            }
            LoadingHelper.removeLoading();
            btn.innerHTML = 'Add token to wallet';
            let walletHelper = new WalletHelper();
            await walletHelper.addTokenToWallet(address, symbol, () => {
                let tokenAddressInput = document.getElementById('tokenAddress');
                if (!tokenAddressInput) return;

                tokenAddressInput.innerHTML = address;
                document.getElementById('copyAddressInfo')!.classList.remove('d-none');
            });
        })
    }
}