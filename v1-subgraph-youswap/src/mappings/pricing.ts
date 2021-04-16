/* eslint-disable prefer-const */
import { Pair, Token, Bundle } from '../types/schema'
import { BigDecimal, Address, BigInt } from '@graphprotocol/graph-ts/index'
import { ZERO_BD, factoryContract, ADDRESS_ZERO, ONE_BD } from './helpers'
import {log} from "@graphprotocol/graph-ts";

const USDT_WETH_PAIR = '0x504393f35e3cf04977845e183841d8e4ec0ef6b3' // created 9827138 block WETH-USDT
// const USDC_WETH_PAIR = '0x167377307ecbf82c72540533924fdd98939b512f' // created 9853141 block WETH-USDC
// const DAI_WETH_PAIR = '0x766cdee046a613fa5e227068b8fd535933a2a0c0' // created 9853158 block WETH-DAI

const WETH_ADDRESS = '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2'
const USDT_ADDRESS = '0xdac17f958d2ee523a2206206994597c13d831ec7';
const USDC_ADDRESS = '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48';
const  DAI_ADDRESS = '0x6b175474e89094c44da98b954eedeac495271d0f';
const  YOU_ADDRESS = '0x1d32916cfa6534d261ad53e2498ab95505bd2510'

export function getEthPriceInUSD(): BigDecimal {
  // fetch eth prices for each stablecoin
  // let daiPair = Pair.load(DAI_WETH_PAIR) // dai is token0
  // let usdcPair = Pair.load(USDC_WETH_PAIR) // usdc is token0
  let usdtPair = Pair.load(USDT_WETH_PAIR) // usdt is token1

  // all 3 have been created
  // if (daiPair !== null && usdcPair !== null && usdtPair !== null) {
  //   let totalLiquidityETH = daiPair.reserve1.plus(usdcPair.reserve1).plus(usdtPair.reserve0)
  //   let daiWeight = daiPair.reserve1.div(totalLiquidityETH)
  //   let usdcWeight = usdcPair.reserve1.div(totalLiquidityETH)
  //   let usdtWeight = usdtPair.reserve0.div(totalLiquidityETH)
  //   return   daiPair.token0Price.times( daiWeight)
  //     .plus(usdcPair.token0Price.times(usdcWeight))
  //     .plus(usdtPair.token1Price.times(usdtWeight))
  //   // dai and USDC have been created
  // } else if (usdcPair !== null && usdtPair !== null) {
  //   let totalLiquidityETH = usdcPair.reserve1.plus(usdtPair.reserve0)
  //   let usdcWeight = usdcPair.reserve1.div(totalLiquidityETH)
  //   let usdtWeight = usdtPair.reserve0.div(totalLiquidityETH)
  //   return usdcPair.token0Price.times(usdcWeight).plus(usdtPair.token1Price.times(usdtWeight))
  //   // USDC is the only pair so far
  // } else
    if (usdtPair !== null) {
    return usdtPair.token1Price
  } else {
    return ZERO_BD
  }
}

// token where amounts should contribute to tracked volume and liquidity
let WHITELIST: string[] = [
    WETH_ADDRESS,
    USDT_ADDRESS,
    // USDC_ADDRESS,
     YOU_ADDRESS,
     // DAI_ADDRESS,
  // '0xc778417e063141139fce010982780140aa0cd5ab', // WETH
  // '0x932d3818a2cd4442430dcb2953694d6cd37bcf9b', // wbfa
  // '0x90336de208310c235759c37867d3a603451d8eee', // wbfb
  // '0x2fdd12d6b68464addd52326c4118986546934cc9', // wbfc
  // '0xfa8b1212119197ec88fc768af1b04ad0519ad994', // USDT
  // '0x0a67d597e48a46b49c2580cec10e1260314e4d35', // USDC
  // '0x34ce2452dbef7c9f69cc6a608ffaa78b126926a5', // DAI
  // '0x1f9840a85d5af5bf1d1762f925bdaddc4201f984', // uni
  // '0x6b175474e89094c44da98b954eedeac495271d0f', // DAI
  // '0x7FE52878e90E7eCbd17b6DcC8Ef12Ac6C10DB648', // USDT XJJ
  // '0x516de3a7a567d81737e3a46ec4ff9cfd1fcb0136'  // Tether USD
  '0x0000111122223333444455556666777788889999'
]

// minimum liquidity required to count towards tracked volume for pairs with small # of Lps
let MINIMUM_USD_THRESHOLD_NEW_PAIRS = BigDecimal.fromString('0')

// minimum liquidity for price to get tracked
let MINIMUM_LIQUIDITY_THRESHOLD_ETH = BigDecimal.fromString('0')

/**
 * Search through graph to find derived Eth per token.
 * @todo update to be derived ETH (add stablecoin estimates)
 **/
export function findEthPerToken(token: Token): BigDecimal {
  if (token.id == WETH_ADDRESS) {
    return ONE_BD
  }
  // loop through whitelist and check if paired with any
  for (let i = 0; i < WHITELIST.length; ++i) {
    let pairAddress = factoryContract.getPair(Address.fromString(token.id), Address.fromString(WHITELIST[i]))
    if (pairAddress.toHexString() != ADDRESS_ZERO) {
      let pair = Pair.load(pairAddress.toHexString())
      if (pair.token0 == WETH_ADDRESS && pair.token1 == USDT_ADDRESS){
        return pair.token0Price // return token1 per our token * Eth per token 1
      }

      if (pair.token0 == token.id && pair.reserveETH.gt(MINIMUM_LIQUIDITY_THRESHOLD_ETH)) {
        let token1 = Token.load(pair.token1)
        return pair.token1Price.times(token1.derivedETH as BigDecimal) // return token1 per our token * Eth per token 1
      }
      if (pair.token1 == token.id && pair.reserveETH.gt(MINIMUM_LIQUIDITY_THRESHOLD_ETH)) {
        let token0 = Token.load(pair.token0)
        return pair.token0Price.times(token0.derivedETH as BigDecimal) // return token0 per our token * ETH per token 0
      }
    }
  }
  return ZERO_BD // nothing was found return 0
}

/**
 * Accepts tokens and amounts, return tracked amount based on token whitelist
 * If one token on whitelist, return amount in that token converted to USD.
 * If both are, return average of two amounts
 * If neither is, return 0
 */
export function getTrackedVolumeUSD(
  tokenAmount0: BigDecimal,
  token0: Token,
  tokenAmount1: BigDecimal,
  token1: Token,
  pair: Pair
): BigDecimal {
  let bundle = Bundle.load('1')
  let price0 = token0.derivedETH.times(bundle.ethPrice)
  let price1 = token1.derivedETH.times(bundle.ethPrice)

  // if less than 5 LPs, require high minimum reserve amount amount or return 0
  if (pair.liquidityProviderCount.lt(BigInt.fromI32(5))) {
    let reserve0USD = pair.reserve0.times(price0)
    let reserve1USD = pair.reserve1.times(price1)
    if (WHITELIST.includes(token0.id) && WHITELIST.includes(token1.id)) {
      if (reserve0USD.plus(reserve1USD).lt(MINIMUM_USD_THRESHOLD_NEW_PAIRS)) {
        return ZERO_BD
      }
    }
    if (WHITELIST.includes(token0.id) && !WHITELIST.includes(token1.id)) {
      if (reserve0USD.times(BigDecimal.fromString('2')).lt(MINIMUM_USD_THRESHOLD_NEW_PAIRS)) {
        return ZERO_BD
      }
    }
    if (!WHITELIST.includes(token0.id) && WHITELIST.includes(token1.id)) {
      if (reserve1USD.times(BigDecimal.fromString('2')).lt(MINIMUM_USD_THRESHOLD_NEW_PAIRS)) {
        return ZERO_BD
      }
    }
  }

  // both are whitelist tokens, take average of both amounts
  if (WHITELIST.includes(token0.id) && WHITELIST.includes(token1.id)) {
    return tokenAmount0
      .times(price0)
      .plus(tokenAmount1.times(price1))
      .div(BigDecimal.fromString('2'))
  }

  // take full value of the whitelisted token amount
  if (WHITELIST.includes(token0.id) && !WHITELIST.includes(token1.id)) {
    return tokenAmount0.times(price0)
  }

  // take full value of the whitelisted token amount
  if (!WHITELIST.includes(token0.id) && WHITELIST.includes(token1.id)) {
    return tokenAmount1.times(price1)
  }

  // neither token is on white list, tracked volume is 0
  return ZERO_BD
}

/**
 * Accepts tokens and amounts, return tracked amount based on token whitelist
 * If one token on whitelist, return amount in that token converted to USD * 2.
 * If both are, return sum of two amounts
 * If neither is, return 0
 */
export function getTrackedLiquidityUSD(
  tokenAmount0: BigDecimal,
  token0: Token,
  tokenAmount1: BigDecimal,
  token1: Token
): BigDecimal {
  let bundle = Bundle.load('1')
  let price0 = token0.derivedETH.times(bundle.ethPrice)
  let price1 = token1.derivedETH.times(bundle.ethPrice)

  // both are whitelist tokens, take average of both amounts
  if (WHITELIST.includes(token0.id) && WHITELIST.includes(token1.id)) {
    return tokenAmount0.times(price0).plus(tokenAmount1.times(price1))
  }

  // take double value of the whitelisted token amount
  if (WHITELIST.includes(token0.id) && !WHITELIST.includes(token1.id)) {
    return tokenAmount0.times(price0).times(BigDecimal.fromString('2'))
  }

  // take double value of the whitelisted token amount
  if (!WHITELIST.includes(token0.id) && WHITELIST.includes(token1.id)) {
    return tokenAmount1.times(price1).times(BigDecimal.fromString('2'))
  }

  // neither token is on white list, tracked volume is 0
  return ZERO_BD
}
