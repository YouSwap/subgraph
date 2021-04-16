/**
 *Submitted for verification at Etherscan.io on 2019-05-15
*/

// File: contracts/utility/interfaces/IOwned.sol

pragma solidity ^0.4.24;

/*
    Owned contract interface
*/
contract IOwned {
    // this function isn't abstract since the compiler emits automatically generated getter functions as external
    function owner() public view returns (address) {}

    function transferOwnership(address _newOwner) public;
    function acceptOwnership() public;
}
