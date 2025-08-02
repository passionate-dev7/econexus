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
/**
 * WalletConnect has certain
 * {@link https://github.com/WalletConnect/walletconnect-monorepo/blob/v2.0/packages/utils/src/errors.ts | error code ranges reserved}
 * for WalletConnect use.
 * The following schema uses negative codes to avoid conflicts.
 *
 * @see {@link https://github.com/WalletConnect/walletconnect-monorepo/blob/v2.0/packages/utils/src/errors.ts | WalletConnect Errors}
 */
/**
 * Object containing specific Hedera errors with their respective codes and messages.
 */
export const HEDERA_ERRORS = {
    INVALID_PARAMS: {
        code: 9000,
        message: 'INVALID_PARAMS',
    },
};
/**
 * Generates a Hedera error response based on the provided key, context, and additional data.
 * @param key - Key representing the specific error type.
 * @param context - Contextual information for the error (optional).
 * @param data - Additional data to include in the error response (optional).
 * @returns A HederaErrorResponse object with the specified code, message, and additional data.
 */
export function getHederaError(key, context, data) {
    const { code, message } = HEDERA_ERRORS[key];
    return {
        code,
        message: context ? `${message} ${context}` : message,
        data,
    };
}
