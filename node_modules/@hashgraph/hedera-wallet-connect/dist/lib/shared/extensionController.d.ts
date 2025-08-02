export declare enum EVENTS {
    extensionQuery = "hedera-extension-query",
    extensionConnect = "hedera-extension-connect-",
    extensionOpen = "hedera-extension-open-",
    extensionResponse = "hedera-extension-response",
    iframeQuery = "hedera-iframe-query",
    iframeQueryResponse = "hedera-iframe-response",
    iframeConnect = "hedera-iframe-connect"
}
export type ExtensionData = {
    id: string;
    name?: string;
    icon?: string;
    url?: string;
    available: boolean;
    availableInIframe: boolean;
};
export declare const findExtensions: (onFound: (_metadata: ExtensionData, isIframe: boolean) => void) => void;
export declare const extensionQuery: () => void;
export declare const extensionConnect: (id: string, isIframe: boolean, pairingString: string) => void;
export declare const extensionOpen: (id: string) => void;
