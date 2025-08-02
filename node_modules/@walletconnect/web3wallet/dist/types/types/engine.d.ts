/// <reference types="node" />
import { AuthEngineTypes, IAuthClient } from "@walletconnect/auth-client";
import { ErrorResponse, JsonRpcResponse } from "@walletconnect/jsonrpc-utils";
import { ISignClient, PendingRequestTypes, ProposalTypes, SessionTypes, EchoClientTypes, AuthTypes } from "@walletconnect/types";
import { IWeb3Wallet, Web3WalletTypes } from "./client";
import EventEmitter from "events";
export declare abstract class IWeb3WalletEngine {
    client: IWeb3Wallet;
    abstract signClient: ISignClient;
    abstract authClient: IAuthClient;
    constructor(client: IWeb3Wallet);
    abstract init(): Promise<void>;
    abstract pair(params: {
        uri: string;
        activatePairing?: boolean;
    }): Promise<void>;
    abstract approveSession(params: {
        id: number;
        namespaces: Record<string, SessionTypes.Namespace>;
        sessionProperties?: ProposalTypes.SessionProperties;
        sessionConfig?: SessionTypes.SessionConfig;
        relayProtocol?: string;
    }): Promise<SessionTypes.Struct>;
    abstract rejectSession(params: {
        id: number;
        reason: ErrorResponse;
    }): Promise<void>;
    abstract updateSession(params: {
        topic: string;
        namespaces: SessionTypes.Namespaces;
    }): Promise<{
        acknowledged: () => Promise<void>;
    }>;
    abstract extendSession(params: {
        topic: string;
    }): Promise<{
        acknowledged: () => Promise<void>;
    }>;
    abstract respondSessionRequest(params: {
        topic: string;
        response: JsonRpcResponse;
    }): Promise<void>;
    abstract emitSessionEvent(params: {
        topic: string;
        event: any;
        chainId: string;
    }): Promise<void>;
    abstract disconnectSession(params: {
        topic: string;
        reason: ErrorResponse;
    }): Promise<void>;
    abstract getActiveSessions(): Record<string, SessionTypes.Struct>;
    abstract getPendingSessionProposals(): Record<number, ProposalTypes.Struct>;
    abstract getPendingSessionRequests(): PendingRequestTypes.Struct[];
    abstract respondAuthRequest(params: AuthEngineTypes.RespondParams, iss: string): Promise<void>;
    abstract getPendingAuthRequests(): Record<number, AuthEngineTypes.PendingRequest>;
    abstract formatMessage(payload: AuthEngineTypes.CacaoRequestPayload, iss: string): string;
    abstract approveSessionAuthenticate(params: AuthTypes.ApproveSessionAuthenticateParams): Promise<{
        session: SessionTypes.Struct | undefined;
    }>;
    abstract formatAuthMessage: (params: {
        request: AuthTypes.BaseAuthRequestParams;
        iss: string;
    }) => string;
    abstract rejectSessionAuthenticate(params: {
        id: number;
        reason: ErrorResponse;
    }): Promise<void>;
    abstract registerDeviceToken(params: EchoClientTypes.RegisterDeviceTokenParams): Promise<void>;
    abstract on: <E extends Web3WalletTypes.Event>(event: E, listener: (args: Web3WalletTypes.EventArguments[E]) => void) => EventEmitter;
    abstract once: <E extends Web3WalletTypes.Event>(event: E, listener: (args: Web3WalletTypes.EventArguments[E]) => void) => EventEmitter;
    abstract off: <E extends Web3WalletTypes.Event>(event: E, listener: (args: Web3WalletTypes.EventArguments[E]) => void) => EventEmitter;
    abstract removeListener: <E extends Web3WalletTypes.Event>(event: E, listener: (args: Web3WalletTypes.EventArguments[E]) => void) => EventEmitter;
}
//# sourceMappingURL=engine.d.ts.map