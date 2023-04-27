import prisma from 'lib/prisma'
import { authOptions } from 'pages/api/auth/[...nextauth].js'
import { getServerSession } from 'next-auth/next'
import middleware from 'middleware/middleware'
import nextConnect from 'next-connect'
import upload from '@/lib/upload'

const handler = nextConnect()
handler.use(middleware)


handler.post(async (req, res) => {

  if (req.method !== 'POST') {
    return res.status(501).end()
  }

  const session = await getServerSession(req, res, authOptions)

  if (!session) return res.status(401).json({ message: 'Not logged in' })

  const user = await prisma.user.findUnique({
    where: {
      id: session.user.id,
    },
  })

  if (!user) return res.status(401).json({ message: 'User not found' })

  if (req.method === 'POST') {
    const post = await prisma.post.create({
      data: {
        title: req.body.title[0],
        content: req.body.content[0],
        subreddit: {
          connect: {
            name: req.body.subreddit_name[0],
          },
        },
        author: {
          connect: { id: user.id },
        },
      },
    })

    if (req.files && req.files.image && req.files.image[0] && req.files.image[0].size > 0) {
      const location = await upload(
        req.files.image[0].path,
        req.files.image[0].originalFilename,
        post.id
      )

      await prisma.post.update({
        where: { id: post.id },
        data: {
          image: location,
        },
      })
    }


    res.json(post)
    return
  }
})

export const config = {
  api: {
    bodyParser: false,
  },
}

export default handler


