import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { usePost } from '../hooks/usePost'
import { useAuth } from '../../auth/hooks/useAuth'
import './feed.scss'

const Feed = () => {
    const navigate = useNavigate()
    const { user } = useAuth()
    const { posts, loading, error, like, hidePost, removePost, fetchPosts } = usePost()

    const [filter, setFilter] = useState('latest') // 'latest' | 'trending'
    const [toastMessage, setToastMessage] = useState('')
    const [heartPops, setHeartPops] = useState({}) // { [postId]: true }
    const [likedPosts, setLikedPosts] = useState({}) // { [postId]: true }

    const showToast = (msg) => {
        setToastMessage(msg)
        setTimeout(() => setToastMessage(''), 3000)
    }

    const handleCreatePostClick = () => {
        if (!user) {
            navigate('/login', { state: { from: '/create-post' } })
            return
        }
        navigate('/create-post')
    }

    const handleLike = async (e, postId) => {
        if (e) e.stopPropagation()
        setLikedPosts((prev) => ({ ...prev, [postId]: true }))
        try {
            await like(postId)
        } catch (err) {
            console.error('Error liking post:', err)
        }
    }

    const handleDoubleTap = (postId) => {
        setHeartPops((prev) => ({ ...prev, [postId]: true }))
        setTimeout(() => {
            setHeartPops((prev) => ({ ...prev, [postId]: false }))
        }, 800)
        handleLike(null, postId)
    }

    const handleShare = async (e, postId) => {
        e.stopPropagation()
        const url = `${window.location.origin}/feed#post-${postId}`
        try {
            if (navigator.clipboard) {
                await navigator.clipboard.writeText(url)
                showToast('Link copied to clipboard!')
            } else {
                showToast('Post link ready!')
            }
        } catch {
            showToast('Post link copied!')
        }
    }

    const handleHide = async (e, postId) => {
        e.stopPropagation()
        try {
            if (hidePost) {
                await hidePost(postId)
                showToast('Post hidden from feed (still saved in your profile)')
            }
        } catch (err) {
            console.error('Failed to hide post:', err)
            showToast('Failed to hide post')
        }
    }

    const handleDelete = async (e, postId) => {
        e.stopPropagation()
        if (window.confirm('Are you sure you want to delete this transmission?')) {
            try {
                if (removePost) {
                    await removePost(postId)
                }
                showToast('Post deleted successfully')
            } catch (err) {
                console.error('Failed to delete post:', err)
                showToast('Failed to delete post')
            }
        }
    }

    const formatTimestamp = (dateString) => {
        if (!dateString) return 'Transmission active'
        const date = new Date(dateString)
        const now = new Date()
        const diffInSeconds = Math.floor((now - date) / 1000)

        if (diffInSeconds < 60) return 'Just now'
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
        if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`
        return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
    }

    // Filter / Sort posts
    const displayedPosts = [...(posts || [])].sort((a, b) => {
        if (filter === 'trending') {
            return (b.likes || 0) - (a.likes || 0)
        }
        // Default latest (createdAt desc or by array order)
        if (a.createdAt && b.createdAt) {
            return new Date(b.createdAt) - new Date(a.createdAt)
        }
        return 0
    })

    return (
        <div className="futuristic-feed-page">
            {/* Ambient Background Glow Effects */}
            <div className="ambient-glow glow-1" />
            <div className="ambient-glow glow-2" />
            <div className="ambient-glow glow-3" />

            {/* Sticky Cyber-Glass Navbar */}
            <header className="feed-navbar">
                <div className="nav-inner">
                    <div className="brand-logo" onClick={() => navigate('/feed')}>
                        <div className="logo-icon">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                            </svg>
                        </div>
                        <span className="brand-name">
                            NEXUS<span className="brand-accent">FEED</span>
                        </span>
                    </div>

                    <div className="nav-actions">
                        <button 
                            type="button" 
                            className="btn-create-post"
                            onClick={handleCreatePostClick}
                        >
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                <line x1="12" y1="5" x2="12" y2="19" />
                                <line x1="5" y1="12" x2="19" y2="12" />
                            </svg>
                            <span>Create Post</span>
                        </button>

                        {user ? (
                            <button 
                                type="button" 
                                className="user-profile-btn" 
                                onClick={() => navigate('/profile')}
                                title="View Profile"
                            >
                                <div className="avatar-glow">
                                    {user.username ? user.username.charAt(0).toUpperCase() : 'U'}
                                </div>
                                <span className="profile-username">{user.username}</span>
                            </button>
                        ) : (
                            <button 
                                type="button" 
                                className="btn-login" 
                                onClick={() => navigate('/login')}
                            >
                                Sign In
                            </button>
                        )}
                    </div>
                </div>
            </header>

            {/* Main Feed Content Area */}
            <main className="feed-main-container">
                {/* Filter and stats control bar */}
                <div className="feed-controls-bar">
                    <div className="filter-tabs">
                        <button
                            type="button"
                            className={`tab-btn ${filter === 'latest' ? 'active' : ''}`}
                            onClick={() => setFilter('latest')}
                        >
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="12" cy="12" r="10" />
                                <polyline points="12 6 12 12 16 14" />
                            </svg>
                            Latest Feed
                        </button>
                        <button
                            type="button"
                            className={`tab-btn ${filter === 'trending' ? 'active' : ''}`}
                            onClick={() => setFilter('trending')}
                        >
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
                            </svg>
                            Trending
                        </button>
                    </div>
                    <div className="feed-stats">
                        Transmissions: <span>{posts?.length || 0}</span>
                    </div>
                </div>

                {/* Loading State with Shimmer Skeletons */}
                {loading && (
                    <div className="feed-skeleton-list">
                        {[1, 2].map((n) => (
                            <div key={n} className="skeleton-card">
                                <div className="skeleton-header">
                                    <div className="skeleton-avatar" />
                                    <div className="skeleton-text-group">
                                        <div className="skeleton-line short" />
                                        <div className="skeleton-line long" />
                                    </div>
                                </div>
                                <div className="skeleton-media" />
                                <div className="skeleton-caption" />
                            </div>
                        ))}
                    </div>
                )}

                {/* Error State */}
                {!loading && error && (
                    <div className="feed-empty-state">
                        <div className="holo-icon-wrapper" style={{ borderColor: '#f43f5e', color: '#f43f5e' }}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="12" cy="12" r="10" />
                                <line x1="12" y1="8" x2="12" y2="12" />
                                <line x1="12" y1="16" x2="12.01" y2="16" />
                            </svg>
                        </div>
                        <h2>Signal Interrupted</h2>
                        <p>Unable to connect to the feed network. Please try refreshing.</p>
                        <button type="button" className="btn-create-empty" onClick={() => fetchPosts()}>
                            Reconnect
                        </button>
                    </div>
                )}

                {/* Empty State */}
                {!loading && !error && displayedPosts.length === 0 && (
                    <div className="feed-empty-state">
                        <div className="holo-icon-wrapper">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
                                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                                <circle cx="8.5" cy="8.5" r="1.5" />
                                <polyline points="21 15 16 10 5 21" />
                            </svg>
                        </div>
                        <h2>No Transmissions Yet</h2>
                        <p>The matrix is quiet. Be the first explorer to broadcast an image transmission.</p>
                        <button type="button" className="btn-create-empty" onClick={handleCreatePostClick}>
                            ⚡ Transmit First Post
                        </button>
                    </div>
                )}

                {/* Posts Stream */}
                {!loading && !error && displayedPosts.length > 0 && (
                    <div className="posts-stream">
                        {displayedPosts.map((post) => {
                            const authorUsername = post.user?.username || (typeof post.user === 'string' ? post.user : 'Cyber Explorer')
                            const isOwner = user && (
                                post.user?._id === user._id || 
                                post.user?._id === user.id || 
                                post.user === user._id || 
                                post.user === user.id
                            )

                            return (
                                <article key={post._id} id={`post-${post._id}`} className="cyber-post-card">
                                    {/* Card Header */}
                                    <div className="card-header">
                                        <div className="author-info">
                                            <div className="avatar-ring">
                                                {post.user?.avatar ? (
                                                    <img src={post.user.avatar} alt={authorUsername} className="avatar-img" />
                                                ) : (
                                                    <div className="avatar-initial">
                                                        {authorUsername.charAt(0).toUpperCase()}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="author-details">
                                                <div className="username-row">
                                                    <span className="author-name">{authorUsername}</span>
                                                    <span className="verified-badge" title="Verified Network Node">
                                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                                                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                                                        </svg>
                                                    </span>
                                                </div>
                                                <span className="post-time">{formatTimestamp(post.createdAt)}</span>
                                            </div>
                                        </div>

                                        {isOwner && (
                                            <div className="card-options">
                                                <button
                                                    type="button"
                                                    className="hide-btn"
                                                    onClick={(e) => handleHide(e, post._id)}
                                                    title="Hide from Feed (keep in Profile)"
                                                >
                                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                                                        <line x1="1" y1="1" x2="23" y2="23" />
                                                    </svg>
                                                    <span>Hide</span>
                                                </button>
                                                <button
                                                    type="button"
                                                    className="delete-btn"
                                                    onClick={(e) => handleDelete(e, post._id)}
                                                    title="Delete Transmission"
                                                >
                                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                        <polyline points="3 6 5 6 21 6" />
                                                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                                                    </svg>
                                                    <span>Delete</span>
                                                </button>
                                            </div>
                                        )}
                                    </div>

                                    {/* Media Image with Double-Tap to Like */}
                                    <div 
                                        className="card-media" 
                                        onDoubleClick={() => handleDoubleTap(post._id)}
                                    >
                                        <img src={post.image} alt={post.caption || "Post media"} loading="lazy" />
                                        {heartPops[post._id] && (
                                            <div className="double-tap-heart">
                                                <svg width="90" height="90" viewBox="0 0 24 24" fill="#ec4899" stroke="#ffffff" strokeWidth="1.5">
                                                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                                                </svg>
                                            </div>
                                        )}
                                    </div>

                                    {/* Card Content & Action Bar */}
                                    <div className="card-content">
                                        <div className="card-actions">
                                            <div className="left-actions">
                                                <button
                                                    type="button"
                                                    className={`like-btn ${likedPosts[post._id] || (post.likes > 0) ? 'liked' : ''}`}
                                                    onClick={(e) => handleLike(e, post._id)}
                                                    title="Like Transmission"
                                                >
                                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                                                    </svg>
                                                    <span>{post.likes || 0}</span>
                                                </button>

                                                <button
                                                    type="button"
                                                    className="share-btn"
                                                    onClick={(e) => handleShare(e, post._id)}
                                                    title="Share Transmission"
                                                >
                                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                        <circle cx="18" cy="5" r="3" />
                                                        <circle cx="6" cy="12" r="3" />
                                                        <circle cx="18" cy="19" r="3" />
                                                        <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                                                        <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
                                                    </svg>
                                                    <span>Share</span>
                                                </button>
                                            </div>

                                            <div className="post-id-badge">
                                                #{post._id?.slice(-5) || 'NODE'}
                                            </div>
                                        </div>

                                        {/* Caption */}
                                        {post.caption && (
                                            <div className="card-caption">
                                                <span className="caption-author">{authorUsername}</span>
                                                <span>
                                                    {post.caption.split(' ').map((word, index) => {
                                                        if (word.startsWith('#')) {
                                                            return <span key={index} className="hashtag">{word} </span>
                                                        }
                                                        return word + ' '
                                                    })}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </article>
                            )
                        })}
                    </div>
                )}
            </main>

            {/* Futuristic Toast Feedback */}
            {toastMessage && (
                <div className="cyber-toast">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                        <polyline points="22 4 12 14.01 9 11.01" />
                    </svg>
                    <span>{toastMessage}</span>
                </div>
            )}
        </div>
    )
}

export default Feed
