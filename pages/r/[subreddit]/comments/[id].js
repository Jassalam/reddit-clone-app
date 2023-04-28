import { useSession } from 'next-auth/react'
import Link from 'next/link'
import prisma from 'lib/prisma'
import { getPost, getSubreddit, getVote, getVotes } from 'lib/data.js'
import timeago from 'lib/timeago'
import NewComment from '@/pages/components/NewComment'
import Comments from '@/pages/components/Comments'
import { useRouter } from 'next/router'
import { authOptions } from '@/pages/api/auth/[...nextauth]'
import { getServerSession } from 'next-auth'

export default function Post({ subreddit, post, votes, vote }) {
  const { data: session, status } = useSession()
  const router = useRouter()

  const loading = status === 'loading'

  if (loading) {
    return null
  }

  if (!post) return <p className='p-5 text-center'>Post does not exist 😞</p>
  const sendVote = async (up) => {
    await fetch('/api/vote', {
      body: JSON.stringify({
        post: post.id,
        up,
      }),
      headers: {
        'Content-Type': 'application/json',
      },
      method: 'POST',
    })

    router.reload(window.location.pathname)
  }


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

      <div className='flex flex-row mb-4  px-10 justify-center'>
        <div className='flex flex-col mb-4 border-t border-l border-b border-3 border-black p-10 bg-gray-200 my-10 text-center'>
          <div 
          className='cursor-pointer'
          onClick={async (e)=> {
            e.preventDefault()
            sendVote(true)
          }}
          >
           {vote?.up ? '⬆' : '↑'}
          </div>
          <div>{votes}</div>
          <div
          className='cursor-pointer'
          onClick={async (e) => {
            e.preventDefault()
            sendVote(false)
          }}
          > {!vote ? '↓' : vote?.up ? '↓' : '⬇'}
          </div>
        </div>

        <div className='flex flex-col mb-4 border-t border-r border-b border-3 border-black p-10 pl-0 bg-gray-200 my-10'></div>
      <div className='flex flex-col p-10 mx-20 my-10 mb-4 bg-gray-200 border border-black border-3'>
        <div className='flex flex-shrink-0 pb-0 '>
          <div className='flex-shrink-0 block group '>
            <div className='flex items-center text-gray-800'>
              Posted by 
              <Link href={`/u/${post.author.username}`} className='ml-1 underline'>
                {post.author.username}</Link>{' '}
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
          {post.image && (
                <img
                className='flex-shrink text-base font-normal color-primary width-auto mt-2'
                src={post.image}
                />
              )}
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
        <Comments comments={post.comments} post={post}/>
      </div>
    </div>
    </>
  )
}

export async function getServerSideProps(context) {
  const session = await getServerSession(context.req, context.res, authOptions)

  const subreddit = await getSubreddit(context.params.subreddit, prisma)
  let post = await getPost(parseInt(context.params.id), prisma)
	post = JSON.parse(JSON.stringify(post))

  let votes = await getVotes(parseInt(context.params.id), prisma)
	votes = JSON.parse(JSON.stringify(votes))

  let vote = await getVote(
    parseInt(context.params.id),
    session?.user.id,
    prisma
  )
	vote = JSON.parse(JSON.stringify(vote))

  return {
    props: {
      subreddit,
      post,
      votes,
      vote,
    },
  }
}