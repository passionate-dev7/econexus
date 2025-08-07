// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.5.0 <0.9.0;
pragma experimental ABIEncoderV2;

interface IHederaTokenService {
    
    struct TokenKey {
        uint keyType;
        KeyValue key;
    }

    struct KeyValue {
        bool inheritAccountKey;
        address contractId;
        bytes ed25519;
        bytes ECDSA_secp256k1;
        address delegatableContractId;
    }

    struct Expiry {
        uint32 second;
        address autoRenewAccount;
        uint32 autoRenewPeriod;
    }

    struct HederaToken {
        string name;
        string symbol;
        address treasury;
        string memo;
        bool tokenSupplyType;
        int64 maxSupply;
        bool freezeDefault;
        TokenKey[] tokenKeys;
        Expiry expiry;
    }

    struct FixedFee {
        int64 amount;
        address tokenId;
        bool useHbarsForPayment;
        bool useCurrentTokenForPayment;
        address feeCollector;
    }

    struct FractionalFee {
        int64 numerator;
        int64 denominator;
        int64 minimumAmount;
        int64 maximumAmount;
        bool netOfTransfers;
        address feeCollector;
    }

    struct RoyaltyFee {
        int64 numerator;
        int64 denominator;
        int64 amount;
        address tokenId;
        bool useHbarsForPayment;
        address feeCollector;
        address fallbackFee;
    }

    function createFungibleToken(
        HederaToken memory token,
        int64 initialTotalSupply,
        int32 decimals
    ) external payable returns (int responseCode, address tokenAddress);

    function createNonFungibleToken(HederaToken memory token)
        external
        payable
        returns (int responseCode, address tokenAddress);

    function mintToken(
        address token,
        int64 amount,
        bytes[] memory metadata
    ) external returns (int responseCode, int64 newTotalSupply, int64[] memory serialNumbers);

    function burnToken(
        address token,
        int64 amount,
        int64[] memory serialNumbers
    ) external returns (int responseCode, int64 newTotalSupply);

    function associateToken(address account, address token)
        external
        returns (int responseCode);

    function dissociateToken(address account, address token)
        external
        returns (int responseCode);

    function transferToken(
        address token,
        address sender,
        address recipient,
        int64 amount
    ) external returns (int responseCode);

    function transferNFT(
        address token,
        address sender,
        address recipient,
        int64 serialNumber
    ) external returns (int responseCode);

    function approveToken(
        address token,
        address owner,
        address spender,
        int64 amount
    ) external returns (int responseCode);

    function approveNFT(
        address token,
        address owner,
        address spender,
        int64 serialNumber
    ) external returns (int responseCode);

    function freezeToken(address token, address account)
        external
        returns (int responseCode);

    function unfreezeToken(address token, address account)
        external
        returns (int responseCode);

    function grantTokenKyc(address token, address account)
        external
        returns (int responseCode);

    function revokeTokenKyc(address token, address account)
        external
        returns (int responseCode);

    function deleteToken(address token) external returns (int responseCode);

    function updateTokenInfo(HederaToken memory token)
        external
        returns (int responseCode);

    function updateTokenKeys(address token, TokenKey[] memory keys)
        external
        returns (int responseCode);

    function getTokenInfo(address token)
        external
        returns (
            int responseCode,
            HederaToken memory tokenInfo
        );
}