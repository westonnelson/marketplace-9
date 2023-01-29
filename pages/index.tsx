import Layout from 'components/Layout'
import type { GetStaticProps, InferGetStaticPropsType, NextPage } from 'next'
import { paths } from '@nftearth/reservoir-sdk'
import setParams from 'lib/params'
import Head from 'next/head'
import TrendingCollectionTable from 'components/TrendingCollectionTable'
import SortTrendingCollections from 'components/SortTrendingCollections'
import Footer from 'components/Footer'
import { useMediaQuery } from '@react-hookz/web'
import { useEffect } from 'react'
import { useRouter } from 'next/router'
import CustomCollectionsGrid from '../components/CustomCollectionsGrid'
import Link from 'next/link'

// Environment variables
// For more information about these variables
// refer to the README.md file on this repository
// Reference: https://nextjs.org/docs/basic-features/environment-variables#exposing-environment-variables-to-the-browser
// REQUIRED
const CHAIN_ID = process.env.NEXT_PUBLIC_CHAIN_ID
const RESERVOIR_API_BASE = process.env.NEXT_PUBLIC_RESERVOIR_API_BASE
const SIMPLEHASH_API_BASE = process.env.NEXT_PUBLIC_SIMPLEHASH_API_BASE;
const SIMPLEHASH_API_KEY = process.env.NEXT_PUBLIC_SIMPLEHASH_API_KEY;

// OPTIONAL
const RESERVOIR_API_KEY = process.env.NEXT_PUBLIC_RESERVOIR_API_KEY
const REDIRECT_HOMEPAGE = process.env.NEXT_PUBLIC_REDIRECT_HOMEPAGE
const META_TITLE = process.env.NEXT_PUBLIC_META_TITLE
const META_DESCRIPTION = process.env.NEXT_PUBLIC_META_DESCRIPTION
const META_IMAGE = process.env.NEXT_PUBLIC_META_OG_IMAGE
const COLLECTION = process.env.NEXT_PUBLIC_COLLECTION
const COMMUNITY = process.env.NEXT_PUBLIC_COMMUNITY
const COLLECTION_SET_ID = process.env.NEXT_PUBLIC_COLLECTION_SET_ID

type Props = InferGetStaticPropsType<typeof getStaticProps>

const Home: NextPage<Props> = ({ fallback }) => {
  const isSmallDevice = useMediaQuery('only screen and (max-width : 600px)')
  const router = useRouter()

  useEffect(() => {
    if (REDIRECT_HOMEPAGE && COLLECTION) {
      router.push(`/collections/${COLLECTION}`)
    }
  }, [COLLECTION, REDIRECT_HOMEPAGE])

  // Return error page if the API base url or the environment's
  // chain ID are missing
  if (!CHAIN_ID) {
    console.debug({ CHAIN_ID })
    return <div>There was an error</div>
  }

  if (REDIRECT_HOMEPAGE && COLLECTION) return null

  return (
    <Layout navbar={{}}>
      <Head>
        <Head>
          <title>{META_TITLE}</title>
          <meta name="description" content={META_DESCRIPTION} />
          <meta name="twitter:image" content={META_IMAGE} />
          <meta name="og:image" content={META_IMAGE} />
        </Head>
      </Head>
      <div className="col-span-full px-6 md:px-16 mb-[50px] main">
        <div className="mb-9 flex w-full items-center justify-between">
          <div className="hero-home">
            <Link href="/stats" legacyBehavior={true}>
              <a
                className="btn-primary-outline gap-1 rounded-full border-transparent bg-gray-100 normal-case focus:ring-0 dark:border-neutral-600 dark:bg-neutral-900 dark:ring-primary-900 dark:focus:ring-4"
              >
                <strong>Discover</strong>
              </a>
            </Link>
          </div>
        </div>
        <div className="mb-9 flex w-full items-center justify-between mt-[60px]">
          <div className="reservoir-h4 text-white">
            Top Collections
          </div>
        </div>
        <CustomCollectionsGrid collections={fallback.topCollections} />
        <div className="mb-9 flex w-full items-center justify-between">
          <div className="reservoir-h4 text-white">
            Trending Collections
          </div>
          {!isSmallDevice && <SortTrendingCollections />}
        </div>
        <TrendingCollectionTable fallback={fallback} />
      </div>
      <Footer />
    </Layout>
  )
}

export default Home

export const getStaticProps: GetStaticProps<{
  fallback: {
    topCollections: any,
    collections: paths['/collections/v5']['get']['responses']['200']['schema']
  }
}> = async () => {
  const options: RequestInit | undefined = {}

  if (RESERVOIR_API_KEY) {
    options.headers = {
      'x-api-key': RESERVOIR_API_KEY,
    }
  }

  const collectionIds = [
    "0x8dbc32a6a29c1398184256a83553d038ae74db62",
    "0x0deaAc29d8A3d4EbBAAa3eCd3cC97C9deF00f720",
    "0x9B9F542456ad12796cCB8EB6644f29E3314e68e1",
    "0x66Deb6cC4d65dc9CB02875DC5E8751d71Fa5D50E",
    "0x9A7657d1593032C75d70950707870c3cC7ca45DC",
    "0x5c9D55b78FEBCC2061715BA4f57EcF8EA2711F2c",
    "0x8E56343adAFA62DaC9C9A8ac8c742851B0fb8b03",
    "0xfa14e1157f35e1dad95dc3f822a9d18c40e360e2",
    "0xA95579592078783B409803Ddc75Bb402C217A924",
    "0x00e3aA03e47c32397a94509E50B0558988C0D04E",
    "0x1e04C33cD5A015e1ced0E3Ecd8BDc42902512124",
    "0x5da95bBdA95Ad9c715195E98a974B2425337c468"

  ]


  const topCollections = await Promise.all(
    collectionIds.map(id => fetch(`${SIMPLEHASH_API_BASE}/api/v0/nfts/collections/optimism/${id}`, {
      // @ts-ignore
      headers: {
        'X-API-KEY': SIMPLEHASH_API_KEY
      }
    }).then(res => res.json())))

  const url = new URL('/collections/v5', RESERVOIR_API_BASE)

  let query: paths['/collections/v5']['get']['parameters']['query'] = {
    limit: 20,
    sortBy: '1DayVolume',
    normalizeRoyalties: true,
  }

  if (COLLECTION && !COMMUNITY) query.contract = [COLLECTION]
  if (COMMUNITY) query.community = COMMUNITY
  if (COLLECTION_SET_ID) query.collectionsSetId = COLLECTION_SET_ID

  const href = setParams(url, query)
  const res = await fetch(href, options)

  const collections = (await res.json()) as Props['fallback']['collections']

  return {
    props: {
      fallback: {
        topCollections: topCollections.map((t, i) => ({
          ...t.collections?.[0],
          id: collectionIds[i]
        })),
        collections,
      },
    },
  }
}
