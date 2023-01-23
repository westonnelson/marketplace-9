import { paths } from '@reservoir0x/reservoir-sdk'
import fetcher from 'lib/fetcher'
import setParams from 'lib/params'
import { NextRouter } from 'next/router'
import moment from 'moment';
import useSWR from 'swr'
import { ethers } from 'ethers'

const PROXY_API_BASE = process.env.NEXT_PUBLIC_PROXY_API_BASE
const PROXY_API_NFT_BASE = process.env.NEXT_PUBLIC_NFT_PROXY_API_BASE

export default function useCollectionStats(
  router: NextRouter,
  collectionId: string | undefined
) {
  function getUrl() {
    if (!collectionId) return undefined

    const pathname = `${PROXY_API_BASE}/stats/v2`

    const query: paths['/stats/v2']['get']['parameters']['query'] = {
      collection: collectionId,
      normalizeRoyalties: true,
    }

    // Extract all queries of attribute type
    const attributes = Object.keys(router.query).filter(
      (key) =>
        key.startsWith('attributes[') &&
        key.endsWith(']') &&
        router.query[key] !== ''
    )

    const query2: { [key: string]: any } = {}

    // Add all selected attributes to the query
    if (attributes.length > 0) {
      attributes.forEach((key) => {
        const value = router.query[key]?.toString()
        if (value) {
          query2[key] = value
        }
      })
    }

    return setParams(pathname, { ...query, ...query2 })
  }

  const href = getUrl()

  const modifiedFetcher = async (href: string) => {
    const response = await fetcher(href);
    const { listings } = await fetch(`${PROXY_API_NFT_BASE}/api/v0/nfts/listings/optimism/${collectionId}?order_by=price_asc&limit=1`)
      .then(res => res.json())
      .catch(() => {});


    // {
    //   tokenCount: number;
    //   onSaleCount: number;
    //   flaggedTokenCount: number;
    //   sampleImages?: definitions["sampleImages"];
    //   market?: definitions["Model54"];
    // }

    if (listings && listings[0]) {
      response.stats.market.floorAsk = {
        ...response.stats.market.floorAsk,
        id: listings[0].id,
        price: {
          amount: {
            raw: listings[0].price,
            decimal: ethers.BigNumber.from(listings[0].price),
            native: ethers.BigNumber.from(listings[0].price),
          },
          netAmount: listings[0].price,
          currency: listings[0].payment_token.symbol,
        },
        maker: listings[0].seller_address,
        validFrom: moment(listings[0].listing_timestamp).unix(),
        validUntil: moment(listings[0].expiration_timestamp).unix()
      };
    }

    return response;
  }

  return useSWR<paths['/stats/v2']['get']['responses']['200']['schema']>(
    href,
    modifiedFetcher
  )
}
