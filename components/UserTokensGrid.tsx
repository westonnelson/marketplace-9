import { FC, useEffect } from 'react'
import LoadingCard from './LoadingCard'
// import { useUserTokens } from '@reservoir0x/reservoir-kit-ui'
import { useInView } from 'react-intersection-observer'
import TokenCard from './TokenCard'
import useNFTBalance from '../hooks/useNFTBalance'

type Props = {
  fallback: {
    tokens: any
  }
  owner: string
}

const UserTokensGrid: FC<Props> = ({ fallback, owner }) => {
  const userTokens = useNFTBalance(owner, {
    limit: 20,
    revalidateOnMount: false,
  });

  useEffect(() => {
    userTokens.mutate()
    return () => {
      userTokens.setSize(1)
    }
  }, [])

  const {
    data: tokens,
    isFetchingInitialData,
    isFetchingPage,
    hasNextPage,
    fetchNextPage,
    mutate,
  } = userTokens
  const isEmpty = tokens.length === 0
  const { ref, inView } = useInView()

  useEffect(() => {
    if (inView && hasNextPage) {
      fetchNextPage()
    }
  }, [inView])

  if (isEmpty && !isFetchingPage) {
    return (
      <div className="grid justify-center text-xl font-semibold">No tokens</div>
    )
  }

  return (
    <div className="mx-auto mb-8 grid max-w-[2400px] gap-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-5">
      {isFetchingInitialData
        ? Array(10)
            .fill(null)
            .map((_, index) => <LoadingCard key={`loading-card-${index}`} />)
        : tokens?.map((token: any) => (
            <TokenCard
              token={{
                token: {
                  ...token,
                  contract: token?.contract_address || '',
                  tokenId: token?.token_id || '',
                  owner: token?.owners?.[0].owner_address,
                  collection: {
                    id: token?.contract_address,
                    ...token?.collection
                  }
                },
                market: {
                  floorAsk: { ...token?.ownership?.floorAsk },
                  topBid: { ...token?.topBid },
                },
              }}
              key={`${token?.contract_address}${token?.token_id}`}
              mutate={mutate}
              collectionImage={token?.collection?.image_url}
            />
          ))}
      {isFetchingPage ? (
        Array(10)
          .fill(null)
          .map((_, index) => {
            if (index === 0) {
              return <LoadingCard key={`loading-card-${index}`} />
            }
            return <LoadingCard key={`loading-card-${index}`} />
          })
      ) : (
        <span ref={ref}/>
      )}
    </div>
  )
}

export default UserTokensGrid
