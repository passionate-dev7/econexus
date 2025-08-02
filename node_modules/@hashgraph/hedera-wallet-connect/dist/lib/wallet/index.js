/*
 *
 * Hedera Wallet Connect
 *
 * Copyright (C) 2023 Hedera Hashgraph, LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */
import { Buffer } from 'buffer';
import { Core } from '@walletconnect/core';
import { Web3Wallet } from '@walletconnect/web3wallet';
import { buildApprovedNamespaces, getSdkError } from '@walletconnect/utils';
import { Wallet as HederaWallet, Client, AccountId } from '@hashgraph/sdk';
import { HederaChainId, HederaSessionEvent, HederaJsonRpcMethod, base64StringToQuery, Uint8ArrayToBase64String, stringToSignerMessage, signatureMapToBase64String, signerSignaturesToSignatureMap, base64StringToTransaction, getHederaError, } from '../shared';
import { proto } from '@hashgraph/proto';
import Provider from './provider';
export { default as WalletProvider } from './provider';
/*
 *
 * @see {@link https://github.com/WalletConnect/walletconnect-monorepo/blob/v2.0/packages/web3wallet/src/client.ts}
 */
export class HederaWeb3Wallet extends Web3Wallet {
    /*
     * Set default values for chains, methods, events
     */
    constructor(opts, chains = Object.values(HederaChainId), methods = Object.values(HederaJsonRpcMethod), sessionEvents = Object.values(HederaSessionEvent)) {
        super(opts);
        this.chains = chains;
        this.methods = methods;
        this.sessionEvents = sessionEvents;
    }
    // wrapper to reduce needing to instantiate Core object on client, also add hedera sensible defaults
    static async create(projectId, metadata, chains, methods, sessionEvents) {
        const wallet = new HederaWeb3Wallet({ core: new Core({ projectId }), metadata }, chains, methods, sessionEvents);
        //https://github.com/WalletConnect/walletconnect-monorepo/blob/14f54684c3d89a5986a68f4dd700a79a958f1604/packages/web3wallet/src/client.ts#L178
        wallet.logger.trace(`Initialized`);
        try {
            await wallet.engine.init();
            wallet.logger.info(`Web3Wallet Initialization Success`);
        }
        catch (error) {
            wallet.logger.info(`Web3Wallet Initialization Failure`);
            wallet.logger.error(error.message);
            throw error;
        }
        return wallet;
    }
    /*
     * Hedera Wallet Signer
     */
    getHederaWallet(chainId, accountId, privateKey, _provider) {
        const network = chainId.split(':')[1];
        const client = Client.forName(network);
        const provider = _provider !== null && _provider !== void 0 ? _provider : new Provider(client);
        return new HederaWallet(accountId, privateKey, provider);
    }
    /*
     * Session proposal
     */
    async buildAndApproveSession(accounts, { id, params }) {
        // filter to get unique chains
        const chains = accounts
            .map((account) => account.split(':').slice(0, 2).join(':'))
            .filter((x, i, a) => a.indexOf(x) == i);
        return await this.approveSession({
            id,
            namespaces: buildApprovedNamespaces({
                proposal: params,
                supportedNamespaces: {
                    hedera: {
                        chains,
                        methods: this.methods,
                        events: this.sessionEvents,
                        accounts,
                    },
                },
            }),
        });
    }
    /*
     *  Session Requests
     */
    validateParam(name, value, expectedType) {
        if (expectedType === 'array' && Array.isArray(value))
            return;
        if (typeof value === expectedType)
            return;
        throw getHederaError('INVALID_PARAMS', `Invalid paramameter value for ${name}, expected ${expectedType} but got ${typeof value}`);
    }
    parseSessionRequest(event, 
    // optional arg to throw error if request is invalid, call with shouldThrow = false when calling from rejectSessionRequest as we only need id and top to send reject response
    shouldThrow = true) {
        const { id, topic } = event;
        const { request: { method, params }, chainId, } = event.params;
        let body;
        // get account id from optional second param for transactions and queries or from transaction id
        // this allows for the case where the requested signer is not the payer, but defaults to the payer if a second param is not provided
        let signerAccountId;
        // First test for valid params for each method
        // then convert params to a body that the respective function expects
        try {
            switch (method) {
                case HederaJsonRpcMethod.GetNodeAddresses: {
                    // 1
                    if (params)
                        throw getHederaError('INVALID_PARAMS');
                    break;
                }
                case HederaJsonRpcMethod.ExecuteTransaction: {
                    // 2
                    const { transactionList } = params;
                    this.validateParam('transactionList', transactionList, 'string');
                    body = base64StringToTransaction(transactionList);
                    break;
                }
                case HederaJsonRpcMethod.SignMessage: {
                    // 3
                    const { signerAccountId: _accountId, message } = params;
                    this.validateParam('signerAccountId', _accountId, 'string');
                    this.validateParam('message', message, 'string');
                    signerAccountId = AccountId.fromString(_accountId.replace(chainId + ':', ''));
                    body = message;
                    break;
                }
                case HederaJsonRpcMethod.SignAndExecuteQuery: {
                    // 4
                    const { signerAccountId: _accountId, query } = params;
                    this.validateParam('signerAccountId', _accountId, 'string');
                    this.validateParam('query', query, 'string');
                    signerAccountId = AccountId.fromString(_accountId.replace(chainId + ':', ''));
                    body = base64StringToQuery(query);
                    break;
                }
                case HederaJsonRpcMethod.SignAndExecuteTransaction: {
                    // 5
                    const { signerAccountId: _accountId, transactionList } = params;
                    this.validateParam('signerAccountId', _accountId, 'string');
                    this.validateParam('transactionList', transactionList, 'string');
                    signerAccountId = AccountId.fromString(_accountId.replace(chainId + ':', ''));
                    body = base64StringToTransaction(transactionList);
                    break;
                }
                case HederaJsonRpcMethod.SignTransaction: {
                    // 6
                    const { signerAccountId: _accountId, transactionBody } = params;
                    this.validateParam('signerAccountId', _accountId, 'string');
                    this.validateParam('transactionBody', transactionBody, 'string');
                    signerAccountId = AccountId.fromString(_accountId.replace(chainId + ':', ''));
                    body = Buffer.from(transactionBody, 'base64');
                    break;
                }
                default:
                    throw getSdkError('INVALID_METHOD');
            }
            // error parsing request params
        }
        catch (e) {
            if (shouldThrow)
                throw e;
        }
        return {
            method: method,
            chainId: chainId,
            id,
            topic,
            body,
            accountId: signerAccountId,
        };
    }
    async executeSessionRequest(event, hederaWallet) {
        const { method, id, topic, body } = this.parseSessionRequest(event);
        return await this[method](id, topic, body, hederaWallet);
    }
    // https://docs.walletconnect.com/web3wallet/wallet-usage#responding-to-session-requests
    async rejectSessionRequest(event, error) {
        const { id, topic } = this.parseSessionRequest(event, false);
        return await this.respondSessionRequest({
            topic,
            response: { id, error, jsonrpc: '2.0' },
        });
    }
    /*
     * JSON RPC Methods
     */
    // 1. hedera_getNodeAddresses
    async hedera_getNodeAddresses(id, topic, _, // ignore this param to be consistent call signature with other functions
    signer) {
        const nodesAccountIds = signer.getNetwork();
        const nodes = Object.values(nodesAccountIds).map((nodeAccountId) => nodeAccountId.toString());
        const response = {
            topic,
            response: {
                jsonrpc: '2.0',
                id,
                result: {
                    nodes,
                },
            },
        };
        return await this.respondSessionRequest(response);
    }
    // 2. hedera_executeTransaction
    async hedera_executeTransaction(id, topic, body, signer) {
        const response = {
            topic,
            response: {
                id,
                result: (await signer.call(body)).toJSON(),
                jsonrpc: '2.0',
            },
        };
        return await this.respondSessionRequest(response);
    }
    // 3. hedera_signMessage
    async hedera_signMessage(id, topic, body, signer) {
        // signer takes an array of Uint8Arrays though spec allows for 1 message to be signed
        const signerSignatures = await signer.sign(stringToSignerMessage(body));
        const _signatureMap = proto.SignatureMap.create(signerSignaturesToSignatureMap(signerSignatures));
        const signatureMap = signatureMapToBase64String(_signatureMap);
        const response = {
            topic,
            response: {
                jsonrpc: '2.0',
                id,
                result: {
                    signatureMap,
                },
            },
        };
        return await this.respondSessionRequest(response);
    }
    // 4. hedera_signAndExecuteQuery
    async hedera_signAndExecuteQuery(id, topic, body, signer) {
        /*
         * Can be used with return values the have a toBytes method implemented
         * For example:
         * https://github.com/hashgraph/hedera-sdk-js/blob/c4438cbaa38074d8bfc934dba84e3b430344ed89/src/account/AccountInfo.js#L402
         */
        const queryResult = await body.executeWithSigner(signer);
        let queryResponse = '';
        if (Array.isArray(queryResult)) {
            queryResponse = queryResult.map((qr) => Uint8ArrayToBase64String(qr.toBytes())).join(',');
        }
        else {
            queryResponse = Uint8ArrayToBase64String(queryResult.toBytes());
        }
        const response = {
            topic,
            response: {
                jsonrpc: '2.0',
                id,
                result: {
                    response: queryResponse,
                },
            },
        };
        return await this.respondSessionRequest(response);
    }
    // 5. hedera_signAndExecuteTransaction
    async hedera_signAndExecuteTransaction(id, topic, body, signer) {
        const signedTransaction = await signer.signTransaction(body);
        const response = {
            topic,
            response: {
                id,
                result: (await signer.call(signedTransaction)).toJSON(),
                jsonrpc: '2.0',
            },
        };
        return await this.respondSessionRequest(response);
    }
    // 6. hedera_signTransaction
    async hedera_signTransaction(id, topic, body, signer) {
        const signerSignatures = await signer.sign([body]);
        const _signatureMap = proto.SignatureMap.create(signerSignaturesToSignatureMap(signerSignatures));
        const signatureMap = signatureMapToBase64String(_signatureMap);
        const response = {
            topic,
            response: {
                jsonrpc: '2.0',
                id,
                result: {
                    signatureMap,
                },
            },
        };
        return await this.respondSessionRequest(response);
    }
}
export default HederaWeb3Wallet;
