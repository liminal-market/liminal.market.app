/* global window */
import {ethers} from 'ethers';
import AbstractWeb3Connector from './AbstractWeb3Connector';
import {Magic} from "magic-sdk";
import {ConnectExtension} from "@magic-ext/connect";
import NetworkInfo from "../networks/NetworkInfo";
import {CustomNodeConfiguration} from "@magic-sdk/types/dist/types/modules/rpc-provider-types";

export default class MagicWeb3Connector extends AbstractWeb3Connector {
    type = 'MagicLink';
    magic: any;

    async activate() {
        let networkInfo = NetworkInfo.getInstance();
        let customNetwork = {rpcUrl: networkInfo.RpcUrl, chainId: networkInfo.ChainId} as CustomNodeConfiguration;
        this.magic = new Magic('pk_live_EA9DDC458FE21B24', {
            extensions: [new ConnectExtension()],
            network: customNetwork
        });

        // @ts-ignore
        let ether = new ethers.providers.Web3Provider(this.magic.rpcProvider);
        let accounts = await ether.listAccounts();

        // Assign Constants
        this.account = accounts[0];
        this.provider = ether.provider;
        this.chainId = `0x${networkInfo.ChainId.toString(16)}`;

        this.subscribeToEvents(this.provider);
        return {
            provider: this.provider,
            account: this.account,
            chainId: this.chainId,
        };

    }

    deactivate = async () => {
        this.unsubscribeToEvents(this.provider);
        if (this.magic) {
            await this.magic.connect.disconnect().catch((e: any) => {
                console.error('error to disconnect:', e);
            });
        }
        this.account = null;
        this.chainId = null;
        this.provider = null;
    };
}
