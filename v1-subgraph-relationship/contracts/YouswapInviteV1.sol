// SPDX-License-Identifier: GPL-3.0

pragma solidity 0.7.4;

import './../interface/IYouswapInviteV1.sol';
import './../library/ErrorCode.sol';

contract YouswapInviteV1 is IYouswapInviteV1 {

    address public zero = address(0);
    address public owner;
    uint256 public startBlock;
    address[] public inviteUserInfoV1;
    mapping(address => UserInfo) public inviteUserInfoV2;

    constructor (){
        owner = address(this);
        startBlock = block.number;
    }
    
    function inviteLength() override external view returns (uint256) {
        return inviteUserInfoV1.length;
    }

    function inviteDown(address _address) override external view returns (address[] memory) {
        return inviteUserInfoV2[_address].down;
    }

    function inviteUp(address _address) override external view returns (address) {
        return inviteUserInfoV2[_address].up;
    }

    function inviteInfoV1(address _address) override external view returns (address[] memory, address[] memory) {
        address[] memory invite1 = inviteUserInfoV2[_address].down;
        uint256 count = 0;
        uint256 len = invite1.length;
        for (uint256 i = 0; i < len; i++) {
            count += inviteUserInfoV2[invite1[i]].down.length;
        }
        address[] memory down;
        address[] memory invite2 = new address[](count);
        count = 0;
        for (uint256 i = 0; i < len; i++) {
            down = inviteUserInfoV2[invite1[i]].down;
            for (uint256 j = 0; j < down.length; j++) {
                invite2[count] = down[j];
                count++;
            }
        }
        
        return (invite1, invite2);
    }

    function inviteInfoV2(address _address) override external view returns (uint256, uint256) {
        address[] memory invite1 = inviteUserInfoV2[_address].down;
        uint256 invite2 = 0;
        uint256 len = invite1.length;
        for (uint256 i = 0; i < len; i++) {
            invite2 += inviteUserInfoV2[invite1[i]].down.length;
        }
        
        return (invite1.length, invite2);
    }

    function invite(address _address) override external {
        require((owner != msg.sender) && (owner != _address) && (msg.sender != _address), ErrorCode.FORBIDDEN);
        UserInfo storage user = inviteUserInfoV2[msg.sender];
        if (0 == user.startBlock) {
            UserInfo storage up = inviteUserInfoV2[_address];
            if (0 == up.startBlock) {
                user.up = zero;
            }else {
                user.up = _address;
                up.down.push(msg.sender);
            }
            user.startBlock = block.number;
            inviteUserInfoV1.push(msg.sender);
        
            emit InviteV1(msg.sender, user.up, user.startBlock);
        }
    }

    function inviteBatch(address[] memory _addresss) override external {
        require(owner != msg.sender, ErrorCode.FORBIDDEN);
        uint len = _addresss.length;
        for (uint i = 0; i < len; i++) {
            if ((owner != _addresss[i]) && (msg.sender != _addresss[i])) {
                UserInfo storage user = inviteUserInfoV2[msg.sender];
                if (0 == user.startBlock) {
                    UserInfo storage up = inviteUserInfoV2[_addresss[i]];
                    if (0 == up.startBlock) {
                        user.up = zero;
                    }else {
                        user.up = _addresss[i];
                        up.down.push(msg.sender);
                    }
                    user.startBlock = block.number;
                    inviteUserInfoV1.push(msg.sender);
        
                    emit InviteV1(msg.sender, user.up, user.startBlock);
                }
            }    
        }
        

    }


}