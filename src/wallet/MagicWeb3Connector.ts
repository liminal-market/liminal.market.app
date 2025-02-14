/* global window */
import {ethers} from 'ethers';
import AbstractWeb3Connector from './AbstractWeb3Connector';
import {Magic} from "magic-sdk";
import {ConnectExtension} from "@magic-ext/connect";
import App from "../main";

export default class MagicWeb3Connector extends AbstractWeb3Connector {
    type = 'MagicLink';
    magic: any | undefined;
    ether: ethers.providers.Web3Provider | null = null;

    async activate() {
        let networkInfo = App.Network;
        let network = {rpcUrl: networkInfo.RpcUrl, chainId: networkInfo.ChainId} as any;
        
        // @ts-ignore
        await window.ethereum.enable();
        // @ts-ignore
        this.ether = new ethers.providers.Web3Provider(window.ethereum);
        this.magic = {};
        /*
        if (networkInfo.ChainId == 31337) 
        {
            // @ts-ignore
            await window.ethereum.enable();
            // @ts-ignore
            this.ether = new ethers.providers.Web3Provider(window.ethereum);
        } else {
            this.magic = new Magic('pk_live_EA9DDC458FE21B24', {
                extensions: [new ConnectExtension()],
                network: network
            });
            this.ether = new ethers.providers.Web3Provider(this.magic.rpcProvider);
        }*/
        let accounts = await this.ether.listAccounts();
        console.log('accounts after new Magic', accounts);
        // Assign Constants
        this.account = accounts[0];
        this.provider = this.ether.provider;
        this.chainId = networkInfo.ChainId;

        this.subscribeToEvents(this.provider);
        return {
            provider: this.provider,
            account: this.account,
            chainId: this.chainId,
            ether: this.ether,
            magic: this.magic,
            signer: this.ether.getSigner()
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
