// src/hooks/usePost.js
import { useState, useEffect, useCallback } from 'react'
import {
    getPosts,
    createPost as createPostService,
    likePost as likePostService,
    deletePost as deletePostService,
} from '../services/post.api'

export function usePost() {
    const [posts, setPosts] = useState([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)

    const fetchPosts = useCallback(async () => {
        setLoading(true)
        setError(null)
        try {
            const data = await getPosts()
            setPosts(data.posts || [])
        } catch (err) {
            setError(err)
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        fetchPosts()
    }, [fetchPosts])

    const addPost = async ({ image, caption }) => {
        const data = await createPostService({ image, caption })
        setPosts((prev) => [data.post, ...prev])
        return data
    }

    const like = async (postId) => {
        const data = await likePostService(postId)
        setPosts((prev) =>
            prev.map((post) =>
                post._id === postId ? { ...post, likes: data.likes } : post
            )
        )
        return data
    }

    const removePost = async (postId) => {
        await deletePostService(postId)
        setPosts((prev) => prev.filter((post) => post._id !== postId))
    }

    return { posts, loading, error, fetchPosts, addPost, like, removePost }
}