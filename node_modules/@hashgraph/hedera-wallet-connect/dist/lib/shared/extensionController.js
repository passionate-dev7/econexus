export var EVENTS;
(function (EVENTS) {
    EVENTS["extensionQuery"] = "hedera-extension-query";
    EVENTS["extensionConnect"] = "hedera-extension-connect-";
    EVENTS["extensionOpen"] = "hedera-extension-open-";
    EVENTS["extensionResponse"] = "hedera-extension-response";
    EVENTS["iframeQuery"] = "hedera-iframe-query";
    EVENTS["iframeQueryResponse"] = "hedera-iframe-response";
    EVENTS["iframeConnect"] = "hedera-iframe-connect";
})(EVENTS || (EVENTS = {}));
export const findExtensions = (onFound) => {
    if (typeof window === 'undefined')
        return;
    window.addEventListener('message', (event) => {
        var _a, _b;
        if (((_a = event === null || event === void 0 ? void 0 : event.data) === null || _a === void 0 ? void 0 : _a.type) == EVENTS.extensionResponse && event.data.metadata) {
            onFound(event.data.metadata, false);
        }
        if (((_b = event === null || event === void 0 ? void 0 : event.data) === null || _b === void 0 ? void 0 : _b.type) == EVENTS.iframeQueryResponse && event.data.metadata) {
            onFound(event.data.metadata, true);
        }
    });
    setTimeout(() => {
        extensionQuery();
    }, 200);
};
export const extensionQuery = () => {
    window.postMessage({ type: EVENTS.extensionQuery }, '*');
    if (window.parent) {
        window.parent.postMessage({ type: EVENTS.iframeQuery }, '*');
    }
};
export const extensionConnect = (id, isIframe, pairingString) => {
    if (isIframe) {
        window.parent.postMessage({ type: EVENTS.iframeConnect, pairingString }, '*');
        return;
    }
    window.postMessage({ type: EVENTS.extensionConnect + id, pairingString }, '*');
};
export const extensionOpen = (id) => {
    window.postMessage({ type: EVENTS.extensionOpen + id }, '*');
};
