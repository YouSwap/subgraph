// SPDX-License-Identifier: GPL-3.0

pragma solidity 0.7.4;

interface IYouswapInviteV1 {

    struct UserInfo {
        address up;//上级
        address[] down;//下级
        uint256 startBlock;//邀请块高
    }

    event InviteV1(address, address, uint256);//我的地址，邀请人的地址，邀请块高

    function inviteLength() external view returns (uint256);//邀请人数

    function inviteDown(address) external view returns (address[] memory);//下级邀请

    function inviteUp(address) external view returns (address);//上级邀请

    function inviteInfoV1(address) external view returns (address[] memory, address[] memory);//下级邀请

    function inviteInfoV2(address) external view returns (uint256, uint256);//下级邀请
    
    function invite(address) external;//注册邀请关系
    
    function inviteBatch(address[] memory) external;//注册邀请关系
   
}