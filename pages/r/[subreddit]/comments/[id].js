import { useSession } from 'next-auth/react'
import Link from 'next/link'
import prisma from 'lib/prisma'
import { getPost, getSubreddit } from 'lib/data.js'
import timeago from 'lib/timeago'
import NewComment from '@/pages/components/NewComment'

export default function Post({ subreddit, post }) {
  const { data: session, status } = useSession()

  const loading = status === 'loading'

  if (loading) {
    return null
  }

  if (!post) return <p className='p-5 text-center'>Post does not exist 😞</p>
  return (
    <>
      <header className='flex h-12 px-5 pt-3 pb-2 text-white bg-black'>
        <Link href={`/`} className='underline'>
          Home
        </Link>
        <p className='grow'></p>
      </header>
      <header className='flex h-12 px-5 pt-3 pb-2 text-white bg-black'>
        <Link href={`/r/${subreddit.name}`} className='text-center underline'>
          /r/{subreddit.name}
        </Link>
        <p className='ml-4 text-left grow'>{subreddit.description}</p>
      </header>
      <div className='flex flex-col p-10 mx-20 my-10 mb-4 bg-gray-200 border border-black border-3'>
        <div className='flex flex-shrink-0 pb-0 '>
          <div className='flex-shrink-0 block group '>
            <div className='flex items-center text-gray-800'>
              Posted by {post.author.username}{' '}
              <p className='mx-2 underline'>
                {timeago.format(new Date(post.createdAt))}
              </p>
            </div>
          </div>
        </div>
        <div className='mt-1'>
          <a className='flex-shrink text-2xl font-bold color-primary width-auto'>
            {post.title}
          </a>
          <p className='flex-shrink mt-2 text-base font-normal color-primary width-auto'>
            {post.content}
          </p>
        </div>
        {session ? (
          <NewComment post={post} />
        ) : (
          <p className='mt-5'>
            <a className='mr-1 underline' href='/api/auth/signin'>
              Login
            </a>
            to add a comment
          </p>
        )}
      </div>
    </>
  )
}

export async function getServerSideProps({ params }) {
  const subreddit = await getSubreddit(params.subreddit, prisma)
  let post = await getPost(parseInt(params.id), prisma)
  post = JSON.parse(JSON.stringify(post))

  return {
    props: {
      subreddit,
      post,
    },
  }
}