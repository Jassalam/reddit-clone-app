import prisma from "@/lib/prisma";
import { getSubreddit, getPostsFromSubreddit } from "@/lib/data";
import Link from "next/link";

import Posts from "../components/Posts";

export default function Subreddit({ subreddit, posts }){
    if(!subreddit) {
        return<p className="text-center p-5">Subreddit does not exist</p>
    }

    return(
        <>
        <Link href={`/`} className="block p-5 text-center underline">
            Back to homepage
        </Link>
        <p className="text-center p-5">/r/{subreddit.name}</p>
        <Posts posts={posts} />
        </>
    )
}

export async function getServerSideProps({ params }){
    const subreddit = await getSubreddit(params.subreddit, prisma)
    let posts = await getPostsFromSubreddit(params.subreddit, prisma)
    posts = JSON.parse(JSON.stringify(posts))


    return{
        props: {
            subreddit,
            posts,
        },
    }
}