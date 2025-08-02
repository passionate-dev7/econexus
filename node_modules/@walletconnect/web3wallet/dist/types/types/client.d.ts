/// <reference types="node" />
import EventEmmiter, { EventEmitter } from "events";
import { ICore, CoreTypes, SignClientTypes } from "@walletconnect/types";
import { AuthClientTypes } from "@walletconnect/auth-client";
import { IWeb3WalletEngine } from "./engine";
import { Logger } from "@walletconnect/logger";
import { JsonRpcPayload } from "@walletconnect/jsonrpc-utils";
export declare namespace Web3WalletTypes {
    type Event = "session_proposal" | "session_request" | "session_delete" | "auth_request" | "proposal_expire" | "session_request_expire" | "session_authenticate";
    interface BaseEventArgs<T = unknown> {
        id: number;
        topic: string;
        params: T;
    }
    type SessionRequest = SignClientTypes.EventArguments["session_request"];
    type SessionProposal = SignClientTypes.EventArguments["session_proposal"];
    type AuthRequest = BaseEventArgs<AuthClientTypes.AuthRequestEventArgs>;
    type SessionDelete = Omit<BaseEventArgs, "params">;
    type ProposalExpire = {
        id: number;
    };
    type SessionRequestExpire = {
        id: number;
    };
    type SessionAuthenticate = SignClientTypes.EventArguments["session_authenticate"];
    type SignConfig = SignClientTypes.Options["signConfig"];
    interface EventArguments {
        session_proposal: SessionProposal;
        session_request: SessionRequest;
        session_delete: Omit<BaseEventArgs, "params">;
        auth_request: AuthRequest;
        proposal_expire: ProposalExpire;
        session_request_expire: SessionRequestExpire;
        session_authenticate: SessionAuthenticate;
    }
    interface Options {
        core: ICore;
        metadata: Metadata;
        name?: string;
        signConfig?: SignConfig;
    }
    type Metadata = CoreTypes.Metadata;
    interface INotifications {
        decryptMessage: (params: {
            topic: string;
            encryptedMessage: string;
            storageOptions?: CoreTypes.Options["storageOptions"];
            storage?: CoreTypes.Options["storage"];
        }) => Promise<JsonRpcPayload>;
        getMetadata: (params: {
            topic: string;
            storageOptions?: CoreTypes.Options["storageOptions"];
            storage?: CoreTypes.Options["storage"];
        }) => Promise<CoreTypes.Metadata>;
    }
}
export declare abstract class IWeb3WalletEvents extends EventEmmiter {
    constructor();
    abstract emit: <E extends Web3WalletTypes.Event>(event: E, args: Web3WalletTypes.EventArguments[E]) => boolean;
    abstract on: <E extends Web3WalletTypes.Event>(event: E, listener: (args: Web3WalletTypes.EventArguments[E]) => any) => this;
    abstract once: <E extends Web3WalletTypes.Event>(event: E, listener: (args: Web3WalletTypes.EventArguments[E]) => any) => this;
    abstract off: <E extends Web3WalletTypes.Event>(event: E, listener: (args: Web3WalletTypes.EventArguments[E]) => any) => this;
    abstract removeListener: <E extends Web3WalletTypes.Event>(event: E, listener: (args: Web3WalletTypes.EventArguments[E]) => any) => this;
}
export declare abstract class IWeb3Wallet {
    opts: Web3WalletTypes.Options;
    abstract readonly name: string;
    abstract engine: IWeb3WalletEngine;
    abstract events: EventEmitter;
    abstract logger: Logger;
    abstract core: ICore;
    abstract metadata: Web3WalletTypes.Metadata;
    abstract signConfig?: Web3WalletTypes.SignConfig;
    constructor(opts: Web3WalletTypes.Options);
    abstract pair: IWeb3WalletEngine["pair"];
    abstract approveSession: IWeb3WalletEngine["approveSession"];
    abstract rejectSession: IWeb3WalletEngine["rejectSession"];
    abstract updateSession: IWeb3WalletEngine["updateSession"];
    abstract extendSession: IWeb3WalletEngine["extendSession"];
    abstract respondSessionRequest: IWeb3WalletEngine["respondSessionRequest"];
    abstract disconnectSession: IWeb3WalletEngine["disconnectSession"];
    abstract emitSessionEvent: IWeb3WalletEngine["emitSessionEvent"];
    abstract getActiveSessions: IWeb3WalletEngine["getActiveSessions"];
    abstract getPendingSessionProposals: IWeb3WalletEngine["getPendingSessionProposals"];
    abstract getPendingSessionRequests: IWeb3WalletEngine["getPendingSessionRequests"];
    abstract respondAuthRequest: IWeb3WalletEngine["respondAuthRequest"];
    abstract getPendingAuthRequests: IWeb3WalletEngine["getPendingAuthRequests"];
    abstract formatMessage: IWeb3WalletEngine["formatMessage"];
    abstract registerDeviceToken: IWeb3WalletEngine["registerDeviceToken"];
    abstract approveSessionAuthenticate: IWeb3WalletEngine["approveSessionAuthenticate"];
    abstract formatAuthMessage: IWeb3WalletEngine["formatAuthMessage"];
    abstract rejectSessionAuthenticate: IWeb3WalletEngine["rejectSessionAuthenticate"];
    abstract on: <E extends Web3WalletTypes.Event>(event: E, listener: (args: Web3WalletTypes.EventArguments[E]) => void) => EventEmitter;
    abstract once: <E extends Web3WalletTypes.Event>(event: E, listener: (args: Web3WalletTypes.EventArguments[E]) => void) => EventEmitter;
    abstract off: <E extends Web3WalletTypes.Event>(event: E, listener: (args: Web3WalletTypes.EventArguments[E]) => void) => EventEmitter;
    abstract removeListener: <E extends Web3WalletTypes.Event>(event: E, listener: (args: Web3WalletTypes.EventArguments[E]) => void) => EventEmitter;
}
//# sourceMappingURL=client.d.ts.map