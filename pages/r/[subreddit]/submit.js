import { useRouter } from 'next/router'
import { useState } from 'react'
import { getSubreddit } from 'lib/data.js'
import prisma from 'lib/prisma'
import Link from 'next/link'
import { useSession } from 'next-auth/react'

export default function NewPost({ subreddit }) {
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [image, setImage] = useState(null)
  const [ imageURL, setImageURL] = useState(null)

  const { data: session, status} = useSession()
  const loading = status === 'loading'

  if(loading){
    return null
  }

  if(!session) return <p className='text-center p-5'> Not Logged in</p>

  if (!subreddit)
    return <p className='p-5 text-center'>Subreddit does not exist 😞</p>

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

      <div className='flex flex-row justify-center px-10 mb-4'>
        <div className='flex flex-col p-10 my-10 mb-4 bg-gray-200 border border-black border-3'>
          <form
            className='flex flex-col '
            onSubmit={async (e) => {
              e.preventDefault()
              if (!title) {
                alert('Enter a title')
                return
              }
              if (!content && !image) {
                alert('Enter some text in the post or add an image')
                return
              }

              const body = new FormData()
              body.append('image', image)
              body.append('title', title)
              body.append('content', content)
              body.append('subreddit_name', subreddit.name) 

              const res = await fetch('/api/post', {
                body,
                method: 'POST',
              })
              router.push(`/r/${subreddit.name}`)
            }}>
            <h2 className='mb-8 text-2xl font-bold'>Create a post</h2>
            <input
              className='w-full p-4 text-lg font-medium bg-transparent border border-b-0 border-gray-700 outline-none '
              rows={1}
              cols={50}
              placeholder='The post title'
              onChange={(e) => setTitle(e.target.value)}
            />
            <textarea
              className='w-full p-4 text-lg font-medium bg-transparent border border-gray-700 outline-none '
              rows={5}
              cols={50}
              placeholder='The post content'
              onChange={(e) => setContent(e.target.value)}
            />
            <div className='text-sm text-gray-600 '>
              <label className='relative font-medium cursor-pointer underline my-3 block'>
                {!imageURL && <p className=''>Upload an image</p>}
              <img src={imageURL} />
          <input
              name='image'
              type='file'
              accept='image/*'
              className='hidden'
              onChange={(event) => {
                if (event.target.files && event.target.files[0]) {
                  if (event.target.files[0].size > 3072000) {
                    alert('Maximum size allowed is 3MB')
                  return false
          }
          setImage(event.target.files[0])
          setImageURL(URL.createObjectURL(event.target.files[0]))
        }
      }}
    />
  </label>
</div>
            <div className='mt-5'>
              <button className='px-8 py-2 mt-0 mr-8 font-bold border border-gray-700 '>
                Post
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  )
}

export async function getServerSideProps({ params }) {
  const subreddit = await getSubreddit(params.subreddit, prisma)

  return {
    props: {
      subreddit,
    },
  }
}