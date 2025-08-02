import { Web3Wallet, Web3WalletTypes } from '@walletconnect/web3wallet';
import { SessionTypes } from '@walletconnect/types';
import { Wallet as HederaWallet, AccountId, Transaction, Query } from '@hashgraph/sdk';
import { HederaChainId, HederaSessionEvent, HederaJsonRpcMethod } from '../shared';
import Provider from './provider';
import type { HederaNativeWallet } from './types';
export type { HederaNativeWallet } from './types';
export { default as WalletProvider } from './provider';
export declare class HederaWeb3Wallet extends Web3Wallet implements HederaNativeWallet {
    chains: HederaChainId[] | string[];
    methods: string[];
    sessionEvents: HederaSessionEvent[] | string[];
    constructor(opts: Web3WalletTypes.Options, chains?: HederaChainId[] | string[], methods?: string[], sessionEvents?: HederaSessionEvent[] | string[]);
    static create(projectId: string, metadata: Web3WalletTypes.Metadata, chains?: HederaChainId[], methods?: string[], sessionEvents?: HederaSessionEvent[] | string[]): Promise<HederaWeb3Wallet>;
    getHederaWallet(chainId: HederaChainId, accountId: AccountId | string, privateKey: string, _provider?: Provider): HederaWallet;
    buildAndApproveSession(accounts: string[], { id, params }: Web3WalletTypes.SessionProposal): Promise<SessionTypes.Struct>;
    validateParam(name: string, value: any, expectedType: string): void;
    parseSessionRequest(event: Web3WalletTypes.SessionRequest, shouldThrow?: boolean): {
        method: HederaJsonRpcMethod;
        chainId: HederaChainId;
        id: number;
        topic: string;
        body?: Transaction | Query<any> | string | Uint8Array | undefined;
        accountId?: AccountId;
    };
    executeSessionRequest(event: Web3WalletTypes.SessionRequest, hederaWallet: HederaWallet): Promise<void>;
    rejectSessionRequest(event: Web3WalletTypes.SessionRequest, error: {
        code: number;
        message: string;
    }): Promise<void>;
    hedera_getNodeAddresses(id: number, topic: string, _: any, // ignore this param to be consistent call signature with other functions
    signer: HederaWallet): Promise<void>;
    hedera_executeTransaction(id: number, topic: string, body: Transaction, signer: HederaWallet): Promise<void>;
    hedera_signMessage(id: number, topic: string, body: string, signer: HederaWallet): Promise<void>;
    hedera_signAndExecuteQuery(id: number, topic: string, body: Query<any>, signer: HederaWallet): Promise<void>;
    hedera_signAndExecuteTransaction(id: number, topic: string, body: Transaction, signer: HederaWallet): Promise<void>;
    hedera_signTransaction(id: number, topic: string, body: Uint8Array, signer: HederaWallet): Promise<void>;
}
export default HederaWeb3Wallet;
