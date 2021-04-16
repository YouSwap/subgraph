# Youswap V1 Subgraph

[Youswap](https://youswap.org/) is a decentralized protocol for automated token exchange on Ethereum.

This subgraph dynamically tracks any pair created by the Youswap factory. It tracks of the current state of Youswap contracts, and contains derived stats for things like historical data and USD prices.

- aggregated data across pairs and tokens,
- data on individual pairs and tokens,
- data on transactions
- data on liquidity providers
- historical data on Youswap, pairs or tokens, aggregated by day

## Running Locally

Make sure to update package.json settings to point to your own graph account.

## Queries

Below are a few ways to show how to query the youswap-subgraph for data. The queries show most of the information that is queryable, but there are many other filtering options that can be used, just check out the [querying api](https://thegraph.com/docs/graphql-api). These queries can be used locally or in The Graph Explorer playground.

## Key Entity Overviews

#### YouswapFactory

Contains data across all of Youswap V2. This entity tracks important things like total liquidity (in ETH and USD, see below), all time volume, transaction count, number of pairs and more.

#### Token

Contains data on a specific token. This token specific data is aggregated across all pairs, and is updated whenever there is a transaction involving that token.

#### Pair

Contains data on a specific pair.

#### Transaction

Every transaction on Youswap is stored. Each transaction contains an array of mints, burns, and swaps that occured within it.

#### Mint, Burn, Swap

These contain specifc information about a transaction. Things like which pair triggered the transaction, amounts, sender, recipient, and more. Each is linked to a parent Transaction entity.

## Example Queries

### Querying Aggregated Youswap Data

This query fetches aggredated data from all youswap pairs and tokens, to give a view into how much activity is happening within the whole protocol.

```graphql
{
  youswapFactories(first: 1) {
    pairCount
    totalVolumeUSD
    totalLiquidityUSD
  }
}
```

```shell
  # 创建
  graph create --node http://127.0.0.1:8020/deploy ropsten
  
  # 构建
  graph codegen
  
  # 发布
  graph deploy --debug --ipfs http://localhost:5001 --node http://127.0.0.1:8020/deploy ropsten
  
  graph deploy --debug --ipfs http://54.254.0.89:5001 --node http://54.254.0.89:8020/deploy ropsten

```
