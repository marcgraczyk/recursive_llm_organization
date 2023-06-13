// SPDX-License-Identifier: MIT
pragma solidity ^0.8.16;

import "@openzeppelin/contracts/access/AccessControl.sol";

contract TargetContract is AccessControl {
    uint256 private value;
    // keccak256("OPERATOR_ROLE")
    bytes32 public constant OPERATOR_ROLE =
        0x97667070c54ef182b0f5858b034beac1b6f3089aa2d3188bb1e8929f4fa9b929;

    event ValueChanged(uint256 newValue);

    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, _msgSender());
        _grantRole(OPERATOR_ROLE, _msgSender());
    }

    function getValue()
        external
        view
        onlyRole(OPERATOR_ROLE)
        returns (uint256)
    {
        return value;
    }

    function setValue(uint256 _value) external onlyRole(OPERATOR_ROLE) {
        require(_value > 0, "Non-zero value");
        value = _value;
        emit ValueChanged(_value);
    }
}
