// {
//   "next": null,
//   "previous": null,
//   "nfts": [
//   {
//     "nft_id": "optimism.0x00e3aa03e47c32397a94509e50b0558988c0d04e.2843",
//     "chain": "optimism",
//     "contract_address": "0x00e3aA03e47c32397a94509E50B0558988C0D04E",
//     "token_id": "2843",
//     "name": "LFNFTOG #2843",
//     "description": "This collection represents early supporters of NFTs on Layer2.",
//     "image_url": null,
//     "video_url": null,
//     "audio_url": null,
//     "model_url": null,
//     "previews": {
//       "image_small_url": null,
//       "image_medium_url": null,
//       "image_large_url": null,
//       "image_opengraph_url": null,
//       "blurhash": null
//     },
//     "background_color": null,
//     "external_url": "https://ogmint.nftearth.exchange",
//     "created_date": "2023-01-12T22:40:46",
//     "status": "minted",
//     "token_count": 1,
//     "owner_count": 1,
//     "owners": [
//       {
//         "owner_address": "0x7D3E5dD617EAF4A3d42EA550C41097086605c4aF",
//         "quantity": 1,
//         "first_acquired_date": "2023-01-12T22:40:46",
//         "last_acquired_date": "2023-01-12T22:40:46"
//       }
//     ],
//     "last_sale": null,
//     "contract": {
//       "type": "ERC721",
//       "name": "L2 NFT OG",
//       "symbol": "L2NFTOG"
//     },
//     "collection": {
//       "collection_id": "e7bbdc381d4c2cc0f90e3fe559210e1e",
//       "name": "L2NFTOG",
//       "description": "This collection represents early supporters of NFTs on Layer2.",
//       "image_url": "https://lh3.googleusercontent.com/W7rm9rFwuaELxqUi5qlnRfmXhmLaI79xciXg8luN-2wXiuZJBIUM9SwuflWyw26LOx6wsXQPemJc2bbmY9wGLeTPy8SwsDEKSD8",
//       "banner_image_url": null,
//       "external_url": "https://ogmint.nftearth.exchange",
//       "twitter_username": null,
//       "discord_url": "https://discord.gg/nftearth",
//       "marketplace_pages": [
//         {
//           "marketplace_id": "opensea",
//           "marketplace_name": "OpenSea",
//           "marketplace_collection_id": "l2-nft-og",
//           "nft_url": "https://opensea.io/assets/optimism/0x00e3aa03e47c32397a94509e50b0558988c0d04e/2843",
//           "collection_url": "https://opensea.io/collection/l2-nft-og",
//           "verified": false
//         }
//       ],
//       "metaplex_mint": null,
//       "metaplex_first_verified_creator": null,
//       "floor_prices": [
//         {
//           "marketplace_id": "opensea",
//           "marketplace_name": "OpenSea",
//           "value": 10000000000000000,
//           "payment_token": {
//             "payment_token_id": "optimism.native",
//             "name": "Ether",
//             "symbol": "ETH",
//             "address": null,
//             "decimals": 18
//           }
//         }
//       ],
//       "distinct_owner_count": 2753,
//       "distinct_nft_count": 2850,
//       "total_quantity": 2850,
//       "top_contracts": [
//         "optimism.0x00e3aa03e47c32397a94509e50b0558988c0d04e"
//       ]
//     },
//     "extra_metadata": {
//       "image_original_url": null,
//       "animation_original_url": null,
//       "metadata_original_url": "ipfs://bafybeicqjg5iccx526ghwb4khgwhh3cvedmljhp6evnkcer34o4wjw4ruy/2843.json"
//     }
//   }
// ]
// }
import useSWRInfinite, { SWRInfiniteKeyLoader } from 'swr/infinite'
import setParams from 'lib/params'
import fetcher from '../lib/fetcher'

const NFT_PROXY_API_BASE = process.env.NEXT_PUBLIC_NFT_PROXY_API_BASE;

const getKey: (
  pathname: string,
  address: string,
  limit: number,
  ...base: Parameters<SWRInfiniteKeyLoader>
) => ReturnType<SWRInfiniteKeyLoader> = (
  pathname: string,
  address:string,
  limit: number,
  index: number,
  previousPageData?: any
) => {
  if (
    previousPageData &&
    (previousPageData.nfts?.length === 0 || !previousPageData.next)
  )
    return null

  if (!NFT_PROXY_API_BASE) {
    console.debug(
      'Environment variable NEXT_PUBLIC_NFT_PROXY_API_BASE is undefined.'
    )
    return null
  }

  let query: any = {
    limit: limit || 50,
    wallet_addresses: address,
    chains: 'optimism'
  }

  if (
    index !== 0 &&
    previousPageData &&
    previousPageData.next !== null
  ) {
    query.cursor = previousPageData.next
  }

  return setParams(pathname, query)
}

export default function useNFTBalance(address: string, options?: any) {
  const pathname = `${NFT_PROXY_API_BASE}/api/v0/nfts/owners`

  const { data, mutate, setSize, size, isValidating, error } = useSWRInfinite(
    (index, previousPageData) =>
      getKey(pathname, address, options?.limit, index, previousPageData),
    fetcher,
    {
      revalidateFirstPage: false,
      ...options,
    }
  )

  const nfts = data?.reduce((a, b) => {
    return (a || []).concat(b.nfts);
  }, []);
  const isFetchingInitialData = !data && !error;
  const isLoadingMore =
    isFetchingInitialData ||
    (size > 0 && data && typeof data[size - 1] === "undefined");
  const isEmpty = data?.[0]?.nfts?.length === 0;
  const isReachingEnd =
    isEmpty || (data && data[data.length - 1].next === null);
  const isRefreshing = isValidating && data && data.length === size;

  return {
    data: nfts || [],
    mutate,
    setSize,
    isFetchingPage: isLoadingMore || isRefreshing,
    isFetchingInitialData,
    hasNextPage: !isReachingEnd,
    fetchNextPage: () => setSize((prev) => prev + 1),
  }
}
