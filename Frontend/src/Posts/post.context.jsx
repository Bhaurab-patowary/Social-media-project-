// src/context/post.context.jsx
import React, { createContext, useState, useEffect, useContext } from 'react'
import { getPosts } from './services/post.api'

const PostContext = createContext()

export const PostProvider = ({ children }) => {
    const [posts, setPosts] = useState([])

    const fetchPosts = () => {
        getPosts()
            .then((res) => setPosts(res.data.posts))
            .catch((err) => console.log(err))
    }

    useEffect(() => {
        fetchPosts()
    }, [])

    const addPost = (newPost) => {
        setPosts((prev) => [newPost, ...prev])
    }

    const updatePostLikes = (postId, likes) => {
        setPosts((prev) =>
            prev.map((post) =>
                post._id === postId ? { ...post, likes } : post
            )
        )
    }

    return (
        <PostContext.Provider value={{ posts, fetchPosts, addPost, updatePostLikes }}>
            {children}
        </PostContext.Provider>
    )
}

// custom hook so you don't import useContext + PostContext everywhere
export const usePosts = () => useContext(PostContext)