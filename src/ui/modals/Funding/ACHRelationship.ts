import AUSDFund from "./AUSDFund";
import ACHRelationshipHtml from '../../../html/modal/Funding/ACHRelationship.html';
import FormHelper from "../../../util/FormHelper";
import UserService from "../../../services/backend/UserService";
import LoadingHelper from "../../../util/LoadingHelper";

export default class ACHRelationship {

    aUsdFund: AUSDFund

    constructor(aUsdFund: AUSDFund) {
        this.aUsdFund = aUsdFund;
    }

    show() {
        let template = Handlebars.compile(ACHRelationshipHtml);

        this.aUsdFund.modal.showModal('Bank information', template({}));

        this.bindEvent();
    }

    private bindEvent() {
        let connectPlaid = document.getElementById('connectPlaid');
        connectPlaid?.addEventListener('click', async () => {
            await this.connectPlaidAction()
        });

        let ach_previous = document.getElementById('ach_previous');
        ach_previous?.addEventListener('click', (evt) => {
            evt.preventDefault();

            this.aUsdFund.selectFundingType.show();
        })
    }

    public async connectPlaidAction() {
        let connectPlaid = document.getElementById('connectPlaid');
        LoadingHelper.setLoading(connectPlaid);
        this.aUsdFund.hideError('achError');

        let userService = new UserService(this.aUsdFund.moralis);
        await userService.getPlaidLinkToken()
            .catch((reason) => {
                this.aUsdFund.showError('achError', reason)
            }).then((response) => {
                console.log('response', response);
                let plaidToken = JSON.parse(response);

                let script = document.createElement('script');
                script.src = 'https://cdn.plaid.com/link/v2/stable/link-initialize.js';
                script.addEventListener('load', () => {
                    this.createPlaidConnection(plaidToken);
                });

                let achForm = document.getElementById('achForm');
                achForm!.append(script);

            }).finally(() => {
                LoadingHelper.removeLoading();
            })
    }

    public createPlaidConnection(plaidToken: any) {
        let linkHandler = Plaid.create({
            token: plaidToken.link_token,
            onSuccess: async (public_token: any, metadata: any) => {
                if (!metadata.account) {
                    this.aUsdFund.showError('achError', "Didn't receive any information from Plaid. Please try again. If it doesn't work. Please contact us at info@liminal.market")
                }

                let userService = new UserService(this.aUsdFund.moralis);
                await userService.createAchRelationship(public_token, metadata.account.id)
                    .catch(async (reason) => {
                        if (reason.error.indexOf('only one active ach relationship') != -1) {
                            let bankRelationships = await userService.getBankRelationships();
                            await this.aUsdFund.transfer.show(bankRelationships[0]);
                        } else {
                            this.aUsdFund.showError('achError', reason);
                        }
                    }).then((response) => {
                        console.log('createAchRelationship', response)
                        this.aUsdFund.transfer.show(response);
                    })

            },
            onExit: (err: any, metadata: any) => {
                console.log(err, metadata);
            },
        });
        linkHandler.open();
    }
}