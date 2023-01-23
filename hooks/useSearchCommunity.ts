import { paths } from '@reservoir0x/reservoir-sdk'
import fetcher from 'lib/fetcher'
import setParams from 'lib/params'
import useSWR from 'swr'

const PROXY_API_BASE = process.env.NEXT_PUBLIC_PROXY_API_BASE
const PROXY_API_NFT_BASE = process.env.NEXT_PUBLIC_NFT_PROXY_API_BASE
const COMMUNITY = process.env.NEXT_PUBLIC_COMMUNITY
const COLLECTION_SET_ID = process.env.NEXT_PUBLIC_COLLECTION_SET_ID


export interface Collection {
  collectionId?: string;
  contract?: string;
  image?: string;
  name?: string;
  allTimeVolume?: number;
  floorAskPrice?: number;
  openseaVerificationStatus?: string;
}

export interface SearchCollectionResponse {
  collections?: Collection
}

export default function useSearchCommunity() {
  const pathname = `${PROXY_API_BASE}/search/collections/v1`

  const query: paths['/search/collections/v1']['get']['parameters']['query'] =
    {}

  if (COLLECTION_SET_ID) {
    query.collectionsSetId = COLLECTION_SET_ID
  } else {
    if (COMMUNITY) query.community = COMMUNITY
  }

  const href = setParams(pathname, query)

  const modifiedFetcher = async (href: string) => {
    const response = await fetcher(href);
    const { collections } = await fetch(`${PROXY_API_NFT_BASE}/api/v0/nfts/collections/optimism/${response.contract}?limit=1`)
      .then(res => res.json())
      .catch(() => {});

    if (collections && collections[0]) {
      response.floorAskPrice = collections[0].floor_prices[0]?.value;
    }

    return response;
  }

  return useSWR<paths['/search/collections/v1']['get']['responses']['200']['schema']>(href, modifiedFetcher)
}
