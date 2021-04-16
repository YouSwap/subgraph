import {BigDecimal, store, json,log} from "@graphprotocol/graph-ts";
import {
  PrivateOffering, PrivateOfferingClaimed,
  PublicOffering,
  PublicOfferingClaimed
} from "../generated/IDO/IDO"
import { Ido,IdoUser } from "../generated/schema"


export function handlePrivateOffering(event: PrivateOffering): void {
  let height = event.block.number
  let timestamp = event.block.timestamp
  let id =  height.toString() + "-" + event.transaction.hash.toHex() + "-" + event.logIndex.toString()
  let ido = Ido.load(id)
  if (ido == null){
    ido = new Ido(id)
  }

  ido.address = event.params.participant.toHex()
  ido.type = "pri"
  ido.usdtpayed = event.params.amountOfUsdt.toBigDecimal()
  ido.usdtused = event.params.amountOfUsdt.toBigDecimal()
  ido.yougoted = event.params.amountOfYou.toBigDecimal()
  ido.transaciton = event.transaction.hash.toHex()
  ido.blockheight = height
  ido.timestmp = timestamp
  ido.state = "true"

  let userid = ido.address
  let user =  IdoUser.load(userid)
  if (user == null){
    user = new IdoUser(userid)
    user.pubcanclaim = false
    user.pubtotalusdtpayed = BigDecimal.fromString("0")
  }
  user.address = ido.address
  user.pricanclaim = true

  ido.user = userid     //关联
  ido.save()
  user.save()
}

export function handlePublicOffering(event: PublicOffering): void {
  let height = event.block.number
  let timestamp = event.block.timestamp
  let id =  height.toString() + "-" + event.transaction.hash.toHex() + "-" + event.logIndex.toString()
  let ido = Ido.load(id)
  if (ido == null){
    ido = new Ido(id)
  }

  ido.address = event.params.participant.toHex()
  ido.type = "pub"
  ido.usdtpayed = event.params.amountOfUsdt.toBigDecimal()
  ido.usdtused = BigDecimal.fromString("0")
  ido.yougoted = BigDecimal.fromString("0")
  ido.transaciton = event.transaction.hash.toHex()
  ido.blockheight = height
  ido.timestmp = timestamp
  ido.state = "true"

  let userid = ido.address
  let user =  IdoUser.load(userid)
  if (user == null){
    user = new IdoUser(userid)
    user.idoslist = []
    user.pricanclaim = false
    user.pubtotalusdtpayed = BigDecimal.fromString("0")
  }
  user.address = ido.address
  let idolist = user.idoslist
  if (idolist == null){
    idolist = []
  }
  idolist.push(id)
  user.idoslist = idolist
  user.pubcanclaim = true
  user.pubtotalusdtpayed = user.pubtotalusdtpayed.plus(ido.usdtpayed)
  ido.user = userid     //关联
  ido.save()
  user.save()
}

export function handlePublicOfferingClaimed(
    event: PublicOfferingClaimed
): void {

  let address = event.params.participant.toHex()
  let user = IdoUser.load(address)
  if (user == null) {
    log.error("结算错误，加载不到user信息 {}", [address] )
    return
  }

  let youamount = event.params.amountOfYou.toBigDecimal()

  let idos = user.idoslist as Array<string>
  log.debug('idoslist = {}', idos)
  if (idos == null){
    return;
  }

  for (let i: i32 = 0, len: i32 = idos.length; i < len; i++) {
      let idoid = idos[i]
      log.debug('idoid : {}',[idoid])
      let ido = Ido.load(idoid)
      if (ido == null){
        ido = new Ido(idoid)
      }
      if ( ido.type != null && ido.type == 'pub'){
        ido.yougoted = ido.usdtpayed.div(user.pubtotalusdtpayed).times(youamount)
        ido.usdtused = ido.yougoted.times(BigDecimal.fromString("0.1"))
        log.debug('ido :yougoted {}  usdtused {}',[ido.yougoted.toString(), ido.usdtused.toString()])
        ido.save()
      }
  }
  user.pubcanclaim = false  // 公募领取后，置为false
  user.save()

  return;
}


export function handlePrivateOfferingClaimed(
    event: PrivateOfferingClaimed
): void {
  let address = event.params.participant.toHex()
  log.debug('PrivateOfferingClaimed,address = {}', [address])
  let user = IdoUser.load(address)
  if (user == null) {
    log.debug("结算错误，加载不到user信息 {}", [address] )
    return
  }
  user.pricanclaim = false  // 私募领取后，置为false
  user.save()

  return;
}