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
import { AccountBalanceQuery, AccountInfoQuery, AccountRecordsQuery, TransactionReceiptQuery, } from '@hashgraph/sdk';
export default class Provider {
    constructor(client) {
        this.client = client;
    }
    static fromClient(client) {
        return new Provider(client);
    }
    getLedgerId() {
        return this.client.ledgerId;
    }
    getNetwork() {
        return this.client.network;
    }
    getMirrorNetwork() {
        return this.client.mirrorNetwork;
    }
    getAccountBalance(accountId) {
        return new AccountBalanceQuery().setAccountId(accountId).execute(this.client);
    }
    getAccountInfo(accountId) {
        return new AccountInfoQuery().setAccountId(accountId).execute(this.client);
    }
    getAccountRecords(accountId) {
        return new AccountRecordsQuery().setAccountId(accountId).execute(this.client);
    }
    getTransactionReceipt(transactionId) {
        return new TransactionReceiptQuery().setTransactionId(transactionId).execute(this.client);
    }
    waitForReceipt(response) {
        return new TransactionReceiptQuery()
            .setNodeAccountIds([response.nodeId])
            .setTransactionId(response.transactionId)
            .execute(this.client);
    }
    call(request) {
        return request.execute(this.client);
    }
}
