"use client";
// import { cookies } from "next/headers";
import PostPage from "@/components/posts/page";
// import { sql } from "@/lib/db";
import React, {useState} from 'react';
import Sidebar from '@/components/sidebar';

export default async function posts(props: { params: Promise<{ id: string }> }) {
    
    // getting username to comment
    // let user: null | { id: string; username: string; email: string } = null;

    // const author_id = await sql`
    //         SELECT author_id FROM posts WHERE post_id = ${}
    //     `;

    // const postMessage = (await sql`
    //     SELECT * FROM posts(${id});
    // `) as {
    //     title: string;
    //     author: string;
    //     content: string;
    //     created_at: string;
    // }[];

    // const commentDetails = (await sql`
    //         SELECT * FROM comments(${author_id})
    //     `);

    const currentDate = new Date();
    const formattedDate = currentDate.toLocaleDateString();

    // const { id } = await props.params;
    // const details = (await sql`
    // SELECT * FROM fetchCategoryDetails(${id});
    // `) as {
    // description: string;
    // theme: string;
    // banner: string;
    // created_at: string;
    // }[];

    //Need
    //get post id
    //responsive design
    //like and dislike
    //input to textarea
    //comment
    //reply
    //author edit posts
return (
    <div>
        {/* post={postMessage} */}
        <PostPage />
        {/* <Sidebar id ={id} details={details} /> */}
    </div>
);
}