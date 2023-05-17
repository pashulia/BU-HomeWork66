// SPDX-License-Identifier: UNLICENSED

pragma solidity 0.8.19;

contract Target {

    uint256 public multiplier;

    constructor(uint256 _multiplier){
        multiplier = _multiplier;
    }

    function getNumber(uint256 _number) public view returns (uint256){
        return _number * multiplier;
    }
}