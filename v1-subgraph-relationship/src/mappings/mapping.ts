
import {BigDecimal, BigInt, log} from "@graphprotocol/graph-ts";
import {InviteV1} from "../types/RelationShip/RelationShip";
import {Count, RelationShip} from "../types/schema";

export function handleRelationShip(event: InviteV1): void {
  let sender = event.params.owner.toHexString()
  log.debug("sender {}", [sender])

  let uper = event.params.upper.toHexString()
  log.debug("uper {}", [uper])

  let height = event.params.height
  log.debug("height {}", [height.toString()])

  let flag = false

  // 一级情况
  if (sender != null && sender.length > 0 && "" !== sender){
    let slaveAddress = RelationShip.load(uper)
    if (slaveAddress !== null && slaveAddress.owner !== null && slaveAddress.owner.length > 0 && "" !== slaveAddress.owner) {

      // 二级情况
      let masterRelation = RelationShip.load(sender + "=" + slaveAddress.owner)
      if (masterRelation == null){
        masterRelation = new RelationShip(sender + "=" + slaveAddress.owner)
      }
      masterRelation.type0 = "2"
      masterRelation.type1 = "a"
      masterRelation.owner = slaveAddress.owner
      masterRelation.address = sender
      masterRelation.height = height
      masterRelation.amount = BigDecimal.fromString("0")

      let count = Count.load(slaveAddress.owner)
      if (count === null){
        count = new Count(slaveAddress.owner)
        count.total = BigInt.fromI32(0)
        count.one = BigInt.fromI32(0)
        count.two = BigInt.fromI32(0)
      }
      count.two = count.two.plus(BigInt.fromI32(1))
      count.total = count.total.plus(BigInt.fromI32(1))
      count.save()

      masterRelation.save()
      flag = true
    }


    let relationShip = new RelationShip(sender)
    relationShip.owner = uper

    relationShip.type0 = "1"
    relationShip.type1 = "b"
    relationShip.address = sender
    relationShip.height = height
    relationShip.amount = BigDecimal.fromString("0")


    let count = Count.load(uper)
    if (count === null){
      count = new Count(uper)
      count.total = BigInt.fromI32(0)
      count.one = BigInt.fromI32(0)
      count.two = BigInt.fromI32(0)
    }
    count.one = count.one.plus(BigInt.fromI32(1))
    count.total = count.total.plus(BigInt.fromI32(1))
    count.save()


    relationShip.save()
  }
}
