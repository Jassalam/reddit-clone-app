import { useSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import { getPosts } from 'lib/data.js'
import prisma from 'lib/prisma'
import Posts from './components/Posts'

export default function Index({ posts }) {
  const { data: session, status } = useSession()
  const router = useRouter()

  if (status === 'loading') {
    return null
  }

  if (session && !session.user.name) {
    router.push('/setup')
  }


  return (
    <div>
      <header className='flex h-12 px-5 pt-3 pb-2 text-white bg-black'>
        <p>Reddit clone</p>
        <p className='grow'></p>
        <a
        className='flex-l border px-4 mb-1 font-bold  rounded-full '
        href={ session ? '/api/auth/signout' : '/api/auth/signin'}>
          {session ? 'logout' : 'login'}
           </a>
      </header>
      <Posts posts={posts} />
    </div>
  )
}

export async function getServerSideProps() {
  let posts = await getPosts(prisma)
  posts = JSON.parse(JSON.stringify(posts))

  return {
    props: {
      posts: posts,
    },
  }
}