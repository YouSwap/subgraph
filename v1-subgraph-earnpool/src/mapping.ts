import { BigInt, log } from "@graphprotocol/graph-ts"
import {
  Earnpool,
  EndPool,
  Mint,
  Stake,
  UnStake,
  UpdatePool,
  WithdrawReward,
  UpdatePower,
  InviteRegister
} from "../generated/Earnpool/Earnpool"
import { Pool, PoolUser, UserPoolList, AllPoolInfo, InviteRegisterRecord } from "../generated/schema"

export function handleEndPool(event: EndPool): void {
  //poolid做pool的唯一键
  let poolid = event.params.pool.toString()
  let pool = Pool.load(poolid)
  if (pool == null) {
    log.error('没有加载到指定pool, {}',[poolid])
    return;
  }
  pool.isfinshed = true
  pool.save()
}

export function handleMint(event: Mint): void {
  //poolid做pool的唯一键
  let poolid = event.params.pool.toString()
  let pool = Pool.load(poolid)
  if (pool == null) {
    log.error('没有加载到指定pool, {}',[poolid])
    return;
  }
  if (!pool.isfinshed) {
    //pool状态未结束时，更新收益总量和可提现总量
    pool.rewardtotal = pool.rewardtotal.plus(event.params.amount)
    pool.rewardcanwithdrawnow = pool.rewardcanwithdrawnow.plus(event.params.amount)
  }else {
    return;
  }

  pool.save()

  //所有池子的总收益量增量保存
  let allpool = AllPoolInfo.load("0")
  if (allpool == null) {
    allpool = new  AllPoolInfo("0")
    allpool.rewardstotal = BigInt.fromI32(0)
    allpool.rewardswithdrawT = BigInt.fromI32(0)
  }
  allpool.rewardstotal = allpool.rewardstotal.plus(event.params.amount)

  allpool.save()
}

export function handleStake(event: Stake): void {
  let poolid = event.params.pool.toString()
  let pool = Pool.load(poolid)
  if (pool == null) {
    log.error('没有加载到指定pool, {}',[poolid])
    return;
  }
  if (!pool.isfinshed) {
    //池子抵押总量对应增加
    pool.staketotaldnow = pool.staketotaldnow.plus(event.params.amount)
  }else {
    return;
  }

  //保存用户信息数据
  let addr = event.params.from.toHex()
  let user = PoolUser.load(addr)
  if (user == null) {
    user = new PoolUser(addr)
    user.address = addr
    user.user = []
  }

  //更新用户关联的池子列表
  let pools = user.user
  pools.push(poolid)
  user.user = pools

  //用户订单信息更新保存  唯一键："池子id"-"用户地址"
  let userpool = UserPoolList.load(poolid + "-" + addr)    // id为poolid+useraddr
  if (userpool == null) {
    userpool = new UserPoolList(poolid + "-" + addr)
    userpool.user = addr
    userpool.pool = poolid
    userpool.stake = BigInt.fromI32(0)
    userpool.stakepower = BigInt.fromI32(0)
    userpool.invitepower = BigInt.fromI32(0)
    userpool.rewardbalance = BigInt.fromI32(0)
    userpool.rewardsT = BigInt.fromI32(0)
    userpool.rewardwithdrawT = BigInt.fromI32(0)
  }
  //更新用户指定池子的抵押总量
  userpool.stake = userpool.stake.plus(event.params.amount)

  user.save()
  userpool.save()
  pool.save()
}

export function handleUnStake(event: UnStake): void {
  let poolid = event.params.pool.toString()
  let pool = Pool.load(poolid)
  if (pool == null) {
    log.error('没有加载到指定pool, {}',[poolid])
    return;
  }

  //ToDo:  池子finshed后还能unstake吗
  //池子对应的抵押总量减量
  pool.staketotaldnow = pool.staketotaldnow.minus(event.params.amount)


  let addr = event.params.to.toHex()
  let user = PoolUser.load(addr)
  if (user == null) {
    log.error('没有加载到指定PoolUser, {}',[addr])
    return;
  }

  let userpool = UserPoolList.load(poolid + "-" + addr)
  if (userpool == null) {
    log.error('没有加载到指定UserPoolList, {}',[addr])
    return;
  }
  //用户指定池子的抵押数量做减量
  userpool.stake = userpool.stake.minus(event.params.amount)

  user.save()
  userpool.save()
  pool.save()

}

export function handleUpdatePool(event: UpdatePool): void {
  let isAdd = event.params.action
  let poolid = event.params.pool
  //log.info('handleUpdatePool, poolid = {} ',[poolid.toString()])
  let lpaddr = event.params.lp.toHex()
  let poolName = event.params.name
  let startB = event.params.startBlock
  let rewardT = event.params.rewardTotal
  let rewardper = event.params.rewardPerBlock
  let rewardMut = event.params.multiple
  let priority = event.params.priority

  if (isAdd) {
    //新建池子
    let pool = new Pool(poolid.toString())
    pool.pool = poolid.toString()
    pool.poolid = poolid
    pool.lpaddress = lpaddr
    pool.poolname = poolName
    pool.startblockheight = startB
    pool.rewardtotal = rewardT
    pool.rewardperblock = rewardper
    pool.rewardmultiple = rewardMut
    pool.priority = priority
    pool.isfinshed = false
    pool.staketotaldnow = BigInt.fromI32(0)
    pool.rewardcanwithdrawnow = BigInt.fromI32(0)

    pool.save()
    return;
  }else {
    //更新池子信息
    let pool = Pool.load(poolid.toString())
    if (pool == null) {
      log.error('没有加载到指定pool, {}',[poolid.toString()])
      return;
    }
    pool.poolname = poolName
    pool.rewardtotal = rewardT
    pool.rewardperblock = rewardper
    pool.rewardmultiple = rewardMut
    pool.priority = priority

    pool.save()
    return;
  }

}

export function handleWithdrawReward(event: WithdrawReward): void {
  let poolid = event.params.pool.toString()
  let pool = Pool.load(poolid)
  if (pool == null) {
    log.error('没有加载到指定pool, {}',[poolid])
    return;
  }
  //池子的可领取收益减量总量减量
  pool.rewardcanwithdrawnow = pool.rewardcanwithdrawnow.minus(event.params.amount)

  pool.save()

  let allpool = AllPoolInfo.load("0")
  if (allpool == null) {
    log.error('没有加载到指定AllPoolInfo, {}',["0"])
    return;
  }
  //所有池子的可领取收益减量
  allpool.rewardswithdrawT = allpool.rewardswithdrawT.plus(event.params.amount)

  allpool.save()
}

export function handleUpdatePower(event: UpdatePower): void {
  let poolid = event.params.pool.toString()
  let pool = Pool.load(poolid)
  if (pool == null) {
    log.error('没有加载到指定pool, {}',[poolid])
    return;
  }
  updatePower(poolid, event.params.owner.toHex(), event.params.ownerPledgePower, event.params.ownerInvitePower)

  updatePower(poolid, event.params.upper1.toHex() ,BigInt.fromI32(-1) , event.params.upper1InvitePower)

  updatePower(poolid, event.params.upper2.toHex() ,BigInt.fromI32(-1) , event.params.upper2InvitePower)

  //更新矿池总算力
  pool.totalpower = event.params.totalPower
  pool.save()
}

/*
**  addr : UserPoolList --- id
**  stakepower: -1  则不更新这一项 ，>=0 用值更新
**  invitepower: -1  则不更新这一项 ，>=0 用值更新
 */
export function updatePower(poolid: string, owner: string, stakepower: BigInt, invitepower: BigInt ): void {

  let pool = Pool.load(poolid)
  if (pool == null){
    log.error('updatePower没有加载到指定pool, {}',[poolid])
    return;
  }
  let  user = PoolUser.load(owner)
  if (user == null){
    user = new PoolUser(owner)
    user.address = owner
    user.user = []
  }
  let pools = user.user
  pools.push(poolid)
  user.user = pools

  user.save()

  let addr = poolid + "-" + owner
  let userpoollist = UserPoolList.load(addr)
  if (userpoollist == null) {
    userpoollist = new UserPoolList(addr)
    userpoollist.stake = BigInt.fromI32(0)
    userpoollist.stakepower = BigInt.fromI32(0)
    userpoollist.invitepower = BigInt.fromI32(0)
    userpoollist.rewardbalance = BigInt.fromI32(0)
    userpoollist.rewardsT = BigInt.fromI32(0)
    userpoollist.rewardwithdrawT = BigInt.fromI32(0)
  }
  userpoollist.user = owner
  userpoollist.pool = poolid
  if (stakepower.ge(BigInt.fromI32(0))) {
    userpoollist.stakepower = stakepower
  }
  if (invitepower.ge(BigInt.fromI32(0))) {
    userpoollist.invitepower = invitepower
  }
  userpoollist.save()

  let users = pool.user
  users.push(owner)
  pool.user = users
  pool.save()
}

export function  handleInviteRegister(event: InviteRegister): void{
  let addr = event.params.self.toHex()
  let inviter = InviteRegisterRecord.load(addr)
  if (inviter == null ){
    inviter = new  InviteRegisterRecord(addr)
    inviter.address = addr
  }

  inviter.save()
}
