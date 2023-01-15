import { optimizeImage } from 'lib/optmizeImage'
import Link from 'next/link'
import React, { FC } from 'react'
import { Collection, TokenDetails } from 'types/reservoir'
import ReactMarkdown from 'react-markdown'

type Props = {
  collection?: Collection
  token?: TokenDetails
}

const CollectionInfo: FC<Props> = ({ collection, token }) => {
  const tokenDescription = token?.description || collection?.description

  return (
    <article className="col-span-full rounded-2xl border border-gray-300 bg-white p-6 dark:border-neutral-600 dark:bg-black">
      <div className="reservoir-h5 mb-4 dark:text-white">Description</div>
      {tokenDescription && (
        <div className="reservoir-body-2 mt-4 break-words dark:text-white">
          <ReactMarkdown className="markdown-support" linkTarget="_blank">
            {tokenDescription}
          </ReactMarkdown>
        </div>
      )}
    </article>
  )
}

export default CollectionInfo
