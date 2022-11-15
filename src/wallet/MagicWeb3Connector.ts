/* global window */
import {ethers} from 'ethers';
import AbstractWeb3Connector from './AbstractWeb3Connector';
import {Magic} from "magic-sdk";
import {ConnectExtension} from "@magic-ext/connect";
import NetworkInfo from "../networks/NetworkInfo";
import {CustomNodeConfiguration} from "@magic-sdk/types/dist/types/modules/rpc-provider-types";

export default class MagicWeb3Connector extends AbstractWeb3Connector {
    type = 'MagicLink';
    magicUser: any;

    async activate({
                       apiKey = '',
                       newSession = '',

                       // Options passed to loginWithMagicLink
                       email = '',
                       showUI = '',
                       redirectURI = '',

                       // Options passed to new Magic creation
                       network = '',
                       locale = '',
                       extensions = '',
                       testMode = '',
                       endpoint = '',
                   } = {}) {
        let networkInfo = NetworkInfo.getInstance();

        let customNetwork = {rpcUrl: networkInfo.RpcUrl, chainId: networkInfo.ChainId} as CustomNodeConfiguration;
        console.log(customNetwork);
        const magic = new Magic('pk_live_EA9DDC458FE21B24', {
            extensions: [new ConnectExtension()],
            network: customNetwork
        });


        // @ts-ignore
        let ether = new ethers.providers.Web3Provider(magic.rpcProvider);
        let accounts = await ether.listAccounts();
        console.log('accounts', accounts);

        // Assign Constants
        this.account = accounts[0];
        this.provider = ether.provider;
        this.chainId = `0x${networkInfo.ChainId.toString(16)}`;
        // Assign magic user for deactivation
        this.magicUser = magic;
        this.subscribeToEvents(this.provider);
        return {
            provider: this.provider,
            account: this.account,
            chainId: this.chainId,
        };

    }

    deactivate = async () => {
        this.unsubscribeToEvents(this.provider);
        console.log('should logout')
        if (this.magicUser) {
            console.log('logout')
            await this.magicUser.connect.disconnect().catch((e: any) => {
                console.log('error to disconnect:', e);
            }).then((response: any) => {
                console.log('disconnected', response)
            });
        }
        this.account = null;
        this.chainId = null;
        this.provider = null;
    };
}
