import WithdrawModalHtml from '../../../html/modal/Funding/WithdrawModal.html'
import Moralis from "moralis";
import Modal from "../Modal";
import AUSDService from "../../../services/blockchain/AUSDService";
import UserService from "../../../services/backend/UserService";
import {BankRelationship} from "../../../dto/alpaca/BankRelationship";
import StringHelper from "../../../util/StringHelper";
import {isJSON, roundNumber} from "../../../util/Helper";
import TransfersList from "./TransfersList";
import {TransferDirectionEnum} from "../../../enums/TransferDirectionEnum";
import BigNumber from "bignumber.js";

export default class WithdrawModal {

    moralis: typeof Moralis;
    private userService: UserService;
    private bankInfo?: BankRelationship;
    private wireTransferCost = 50;
    private achTransferCost = 25;
    private transferCost: number;
    private currentBalance?: BigNumber;
    private transfersList: TransfersList;

    constructor(moralis: typeof Moralis) {
        this.moralis = moralis;
        this.userService = new UserService(this.moralis);
        this.transferCost = this.wireTransferCost;

        this.transfersList = new TransfersList(this.moralis)
    }

    public async show() {
        let modal = new Modal();
        let bankRelationships = await this.userService.getBankRelationship();
        if (!bankRelationships) {
            modal.showModal('Withdraw information', "You haven't setup bank connection. You cannot withdraw from without bank connection");
            return;
        }

        let transfersHtml = await this.transfersList.render(TransferDirectionEnum.Outgoing);
        let ethAddress = this.userService.getEthAddress();

        let ausdService = new AUSDService(this.moralis);
        this.currentBalance = new BigNumber(0);
        if (ethAddress) {
            this.currentBalance = await ausdService.getAUSDBalanceOf(ethAddress);
        }

        if (this.currentBalance.eq(0)) {
            let tmp = Handlebars.compile("Your current balance is $0. There is nothing to withdraw. {{{transfers}}}");
            modal.showModal('Withdraw information', tmp({transfers: transfersHtml}));
            return;
        }
        let withdrawTemplate = Handlebars.compile(WithdrawModalHtml);

        this.bankInfo = bankRelationships;
        this.transferCost = (this.bankInfo.bank_code_type) ? this.wireTransferCost : this.achTransferCost;

        let obj: any = {
            amount: this.currentBalance,
            transferCost: this.transferCost,
            Transfers: transfersHtml,
            bank: this.bankInfo!
        };

        modal.showModal('Withdraw information', withdrawTemplate(obj));

        this.bindEvents();
        this.transfersList.bindEvents();
    }

    private bindEvents() {
        let confirmWithdraw = document.getElementById('confirmWithdraw');
        confirmWithdraw?.addEventListener('click', async (evt) => {
            evt.preventDefault();
            if (!this.bankInfo) return;

            let amount = document.getElementById('amount') as HTMLInputElement;
            if (StringHelper.isNullOrEmpty(amount.value)) {
                amount.setAttribute('aria-invalid', 'true');
                return;
            } else if (parseFloat(amount.value) <= this.transferCost) {
                let withdrawAmountError = document.getElementById('withdrawAmountError');
                withdrawAmountError!.style.display = 'block';
                amount.setAttribute('aria-invalid', 'true');

                return;
            } else {
                amount.setAttribute('aria-invalid', 'false');
            }

            this.showWithdrawConfirmation();
        })
    }

    private showWithdrawConfirmation() {
        if (!this.bankInfo) return;

        let amount = document.getElementById('amount') as HTMLInputElement;

        let withdrawInput = document.getElementById('withdrawInput');
        withdrawInput?.classList.add('hidden');

        let withdrawConfirm = document.getElementById('withdrawConfirm');
        withdrawConfirm?.classList.remove('hidden')

        let withdrawAmountText = document.getElementById('withdrawAmountText');
        let feeWarning = document.getElementById('feeWarning');
        let feePercentage = document.getElementById('feePercentage');

        withdrawAmountText!.innerText = amount.value;
        feeWarning!.innerText = this.transferCost.toString();
        feePercentage!.innerText = roundNumber((this.transferCost / parseFloat(amount.value)) * 100).toString();


        let confirmWithdrawButton = document.getElementById('confirmWithdrawButton');
        confirmWithdrawButton?.addEventListener('click', async (evt) => {
            evt.preventDefault();

            await this.userService.createTransfer(amount.value, TransferDirectionEnum.Outgoing)
                .then(async (response) => {
                    withdrawConfirm!.innerHTML = await this.transfersList.render(TransferDirectionEnum.Outgoing);
                    this.transfersList.bindEvents();
                })
                .catch(reason => {
                    let withdrawError = document.getElementById('withdrawError');
                    if (!withdrawError) return;

                    if (withdrawError && isJSON(reason.message)) {
                        let error = JSON.parse(reason.message);
                        withdrawError.innerText = error.serverError.message;
                    } else {
                        withdrawError.innerText = reason.toString();
                    }

                    withdrawError.style.display = 'block';
                });
        })

    }
}