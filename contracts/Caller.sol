// SPDX-License-Identifier: UNLICENSED

pragma solidity 0.8.19;

interface ITarget{
    function getNumber(uint256) external view returns (uint256);
}

contract Caller {

    struct Stake{
        uint256 value;
        uint256 lockTime;
    }

    uint256 public number;
    address constant public target = 0xC8fC9C5872EA26dc43Aa91896005B82fCeCbd03a;

    mapping(address => Stake) public stakes;

    event SetNumber(uint256 indexed number);

    function setNumber(uint256 _number) public {
        number = ITarget(target).getNumber(_number);
        emit SetNumber(number);
    }

    function lockEth(uint256 _lockTime) public payable {
        require(stakes[msg.sender].value == 0, "You already have a stake");
        stakes[msg.sender] = Stake(msg.value, block.timestamp + _lockTime);
    }

    function unloclEth() public {
        require(stakes[msg.sender].value > 0, "You don't have a stake");
        require(block.timestamp > stakes[msg.sender].lockTime, "You can't take out yet a stake");
        uint256 value = stakes[msg.sender].value;
        stakes[msg.sender].value = 0;
        payable(msg.sender).transfer(value);
    }

}