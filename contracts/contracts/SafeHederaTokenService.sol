// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.5.0 <0.9.0;
pragma experimental ABIEncoderV2;

import "./IHederaTokenService.sol";

abstract contract SafeHederaTokenService {
    address constant precompileAddress = address(0x167);
    
    function safeAssociateToken(address token, address account) internal {
        (bool success, bytes memory result) = precompileAddress.call(
            abi.encodeWithSelector(IHederaTokenService.associateToken.selector, account, token)
        );
        require(success);
        int responseCode = abi.decode(result, (int32));
        require(responseCode == 22, "Failed to associate token");
    }

    function safeTransferToken(address token, address sender, address receiver, int64 amount) internal {
        (bool success, bytes memory result) = precompileAddress.call(
            abi.encodeWithSelector(
                IHederaTokenService.transferToken.selector,
                token,
                sender,
                receiver,
                amount
            )
        );
        require(success);
        int responseCode = abi.decode(result, (int32));
        require(responseCode == 22, "Failed to transfer token");
    }

    function safeMintToken(address token, int64 amount, bytes[] memory metadata) internal 
        returns (int64 newTotalSupply, int64[] memory serialNumbers) 
    {
        (bool success, bytes memory result) = precompileAddress.call(
            abi.encodeWithSelector(
                IHederaTokenService.mintToken.selector,
                token,
                amount,
                metadata
            )
        );
        require(success);
        (int responseCode, int64 _newTotalSupply, int64[] memory _serialNumbers) = abi.decode(
            result,
            (int32, int64, int64[])
        );
        require(responseCode == 22, "Failed to mint token");
        return (_newTotalSupply, _serialNumbers);
    }

    function safeBurnToken(address token, int64 amount, int64[] memory serialNumbers) internal
        returns (int64 newTotalSupply)
    {
        (bool success, bytes memory result) = precompileAddress.call(
            abi.encodeWithSelector(
                IHederaTokenService.burnToken.selector,
                token,
                amount,
                serialNumbers
            )
        );
        require(success);
        (int responseCode, int64 _newTotalSupply) = abi.decode(result, (int32, int64));
        require(responseCode == 22, "Failed to burn token");
        return _newTotalSupply;
    }
}