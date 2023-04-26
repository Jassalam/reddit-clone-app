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

  if (session) {
    router.push('/')
  }

  return (
    <div>
      <a href='/api/auth/signin'>login</a>
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