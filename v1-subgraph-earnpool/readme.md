查询方法：
{
allPoolInfo(id: "0"){
rewardstotal
}


poolUser(id: "0x07346765d6063180dc2a09b1774e3cd34ca38cc3"){
    id                  
    address
    user{
    id
    isfinshed
    pool
    poolname
    startblockheight
    rewardtotal
    rewardperblock
    rewardmultiple
    priority
    staketotaldnow
    rewardcanwithdrawnow
    }

    poolsinfo{
      id
      stake
      rewardbalance
      rewardsT
      rewardwithdrawT

    }
}


}