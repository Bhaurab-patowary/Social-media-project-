import React, { useState, useRef, useEffect } from 'react'
import { useNavigate } from "react-router-dom"
import { usePost } from '../hooks/usePost'
import { useAuth } from '../../auth/hooks/useAuth'
import './createPost.scss'

const CreatePost = () => {
    const navigate = useNavigate()
    const { addPost } = usePost()
    const { user } = useAuth()

    const [caption, setCaption] = useState("")
    const [image, setImage] = useState(null)
    const [previewUrl, setPreviewUrl] = useState(null)
    const [isDragging, setIsDragging] = useState(false)
    const [submitting, setSubmitting] = useState(false)
    const [errorMessage, setErrorMessage] = useState("")

    const fileInputRef = useRef(null)

    // Cleanup object URL memory leak
    useEffect(() => {
        return () => {
            if (previewUrl) {
                URL.revokeObjectURL(previewUrl)
            }
        }
    }, [previewUrl])

    const handleFile = (file) => {
        if (!file) return

        // Validate file type
        if (!file.type.startsWith('image/')) {
            setErrorMessage("Please upload a valid image file (PNG, JPG, WEBP, GIF).")
            return
        }

        // Validate max file size (10MB)
        if (file.size > 10 * 1024 * 1024) {
            setErrorMessage("Image file size should be less than 10MB.")
            return
        }

        setErrorMessage("")
        setImage(file)
        if (previewUrl) {
            URL.revokeObjectURL(previewUrl)
        }
        setPreviewUrl(URL.createObjectURL(file))
    }

    const handleFileInputChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            handleFile(e.target.files[0])
        }
    }

    const handleDragOver = (e) => {
        e.preventDefault()
        e.stopPropagation()
        setIsDragging(true)
    }

    const handleDragLeave = (e) => {
        e.preventDefault()
        e.stopPropagation()
        setIsDragging(false)
    }

    const handleDrop = (e) => {
        e.preventDefault()
        e.stopPropagation()
        setIsDragging(false)

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFile(e.dataTransfer.files[0])
        }
    }

    const handleRemoveImage = (e) => {
        e.stopPropagation()
        if (previewUrl) {
            URL.revokeObjectURL(previewUrl)
        }
        setImage(null)
        setPreviewUrl(null)
        if (fileInputRef.current) {
            fileInputRef.current.value = ""
        }
    }

    const formatFileSize = (bytes) => {
        if (!bytes) return ''
        const kb = bytes / 1024
        if (kb < 1024) return `${kb.toFixed(1)} KB`
        return `${(kb / 1024).toFixed(1)} MB`
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (!image) {
            setErrorMessage("Please select or drop an image for your post.")
            return
        }

        if (!caption.trim()) {
            setErrorMessage("Please enter a caption for your post.")
            return
        }

        setSubmitting(true)
        setErrorMessage("")

        try {
            await addPost({ image, caption })
            navigate("/feed")
        } catch (err) {
            console.error("Error creating post:", err)
            setErrorMessage(err?.response?.data?.message || "Failed to create post. Please try again.")
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <section className="create-post-page">
            <div className="create-post-container">
                {/* Top Navigation */}
                <div className="top-nav">
                    <button 
                        type="button" 
                        className="back-btn" 
                        onClick={() => navigate('/feed')}
                        aria-label="Back to feed"
                    >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M19 12H5M12 19l-7-7 7-7" />
                        </svg>
                        Back to Feed
                    </button>

                    {user && (
                        <div className="user-pill">
                            <div className="user-avatar-dot">
                                {user.username ? user.username.charAt(0).toUpperCase() : 'U'}
                            </div>
                            <span>Posting as <strong className="username">{user.username}</strong></span>
                        </div>
                    )}
                </div>

                {/* Main Card */}
                <div className="create-post-card">
                    <div className="card-header">
                        <span className="header-badge">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                            </svg>
                            New Content
                        </span>
                        <h1>Create a Post</h1>
                        <p>Share a photo and story with your community</p>
                    </div>

                    {/* Error Banner */}
                    {errorMessage && (
                        <div className="error-banner" role="alert">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="12" cy="12" r="10" />
                                <line x1="12" y1="8" x2="12" y2="12" />
                                <line x1="12" y1="16" x2="12.01" y2="16" />
                            </svg>
                            <span>{errorMessage}</span>
                        </div>
                    )}

                    {/* Form */}
                    <form className="post-form" onSubmit={handleSubmit}>
                        {/* Image Upload Dropzone */}
                        <div className="form-group">
                            <div className="group-label">
                                <span>Media Upload <span className="required">*</span></span>
                                <span className="helper-text">Max size: 10MB</span>
                            </div>

                            <div 
                                className={`upload-dropzone ${isDragging ? 'drag-active' : ''}`}
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                                onDrop={handleDrop}
                                onClick={() => !previewUrl && fileInputRef.current?.click()}
                            >
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    name="image"
                                    accept="image/*"
                                    className="file-input"
                                    onChange={handleFileInputChange}
                                />

                                {previewUrl ? (
                                    <div className="preview-container">
                                        <img 
                                            src={previewUrl} 
                                            alt="Post Preview" 
                                            className="preview-image" 
                                        />
                                        <div className="preview-overlay">
                                            <div className="file-info-badge">
                                                <span>📷 {image?.name}</span>
                                                <span>•</span>
                                                <span>{formatFileSize(image?.size)}</span>
                                            </div>
                                            <div className="preview-actions">
                                                <button
                                                    type="button"
                                                    className="action-btn"
                                                    onClick={(e) => {
                                                        e.stopPropagation()
                                                        fileInputRef.current?.click()
                                                    }}
                                                >
                                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                                        <polyline points="17 8 12 3 7 8" />
                                                        <line x1="12" y1="3" x2="12" y2="15" />
                                                    </svg>
                                                    Change
                                                </button>
                                                <button
                                                    type="button"
                                                    className="action-btn danger"
                                                    onClick={handleRemoveImage}
                                                >
                                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                        <polyline points="3 6 5 6 21 6" />
                                                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                                                    </svg>
                                                    Remove
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="dropzone-prompt">
                                        <div className="icon-circle">
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
                                                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                                                <circle cx="8.5" cy="8.5" r="1.5" />
                                                <polyline points="21 15 16 10 5 21" />
                                            </svg>
                                        </div>
                                        <div className="prompt-title">
                                            <span>Click to browse</span> or drag and drop image here
                                        </div>
                                        <div className="prompt-subtitle">
                                            High-resolution images look best on feeds
                                        </div>
                                        <div className="format-badges">
                                            <span>PNG</span>
                                            <span>JPG</span>
                                            <span>WEBP</span>
                                            <span>GIF</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Caption Input */}
                        <div className="form-group">
                            <div className="group-label">
                                <span>Caption <span className="required">*</span></span>
                            </div>
                            <div className="caption-wrapper">
                                <textarea
                                    className="caption-textarea"
                                    name="caption"
                                    placeholder="Write an engaging caption, add thoughts or tags..."
                                    value={caption}
                                    onChange={(e) => setCaption(e.target.value)}
                                    maxLength={500}
                                    rows={4}
                                    required
                                />
                                <div className="caption-footer">
                                    <span className="caption-hints">Tip: Use hashtags to reach more viewers</span>
                                    <span className={`char-count ${caption.length > 450 ? 'limit-warn' : ''}`}>
                                        {caption.length} / 500
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="form-actions">
                            <button
                                type="button"
                                className="btn-secondary"
                                onClick={() => navigate('/feed')}
                                disabled={submitting}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="btn-submit"
                                disabled={submitting || !image || !caption.trim()}
                            >
                                {submitting ? (
                                    <>
                                        <div className="spinner" />
                                        <span>Publishing...</span>
                                    </>
                                ) : (
                                    <>
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <line x1="22" y1="2" x2="11" y2="13" />
                                            <polygon points="22 2 15 22 11 13 2 9 22 2" />
                                        </svg>
                                        <span>Publish Post</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </section>
    )
}

export default CreatePost