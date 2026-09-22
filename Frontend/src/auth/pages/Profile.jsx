import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { getProfile, updateProfile } from '../services/auth.api';
import { deletePost } from '../../Posts/services/post.api';
import '../profile.scss';

const Profile = () => {
    const navigate = useNavigate();
    const { user, setUser, handleLogout } = useAuth();

    const [profileUser, setProfileUser] = useState(null);
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [deletingPostId, setDeletingPostId] = useState(null);

    // Edit Profile state
    const [isEditing, setIsEditing] = useState(false);
    const [editUsername, setEditUsername] = useState("");
    const [editBio, setEditBio] = useState("");
    const [avatarFile, setAvatarFile] = useState(null);
    const [updating, setUpdating] = useState(false);

    const fetchProfileData = async () => {
        try {
            setLoading(true);
            const data = await getProfile();
            setProfileUser(data.user);
            setPosts(data.posts || []);
            setEditUsername(data.user.username || "");
            setEditBio(data.user.bio || "");
        } catch (err) {
            console.error("Failed to fetch profile", err);
            setError("Failed to load profile data.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProfileData();
    }, []);

    const onLogout = async () => {
        await handleLogout();
        navigate('/login');
    };

    const handleUpdateSubmit = async (e) => {
        e.preventDefault();
        setUpdating(true);
        try {
            const formData = new FormData();
            formData.append("username", editUsername);
            formData.append("bio", editBio);
            if (avatarFile) {
                formData.append("avatar", avatarFile);
            }

            const res = await updateProfile(formData);
            setProfileUser(res.user);
            setUser(res.user);
            setIsEditing(false);
            setAvatarFile(null);
        } catch (err) {
            console.error("Failed to update profile", err);
            alert(err.response?.data?.message || "Failed to update profile");
        } finally {
            setUpdating(false);
        }
    };

    const handleDeletePost = async (postId) => {
        const confirmed = window.confirm("Are you sure you want to delete this post?");
        if (!confirmed) return;

        try {
            setDeletingPostId(postId);
            await deletePost(postId);
            setPosts((prev) => prev.filter((p) => p._id !== postId));
        } catch (err) {
            console.error("Failed to delete post", err);
            alert(err.response?.data?.message || "Failed to delete post");
        } finally {
            setDeletingPostId(null);
        }
    };

    if (loading) {
        return (
            <div className="profile-page">
                <div className="profile-container">
                    {/* <h2 style={{ textAlign: 'center', marginTop: '3rem', color: '#64748b' }}>
                        Loading profile...
                    </h2> */}
                    <div className="loader">
                        
                    </div>
                </div>
            </div>
        );
    }

    if (error || !profileUser) {
        return (
            <div className="profile-page">
                <div className="profile-container">
                    <h2 style={{ textAlign: 'center', marginTop: '3rem', color: '#ef4444' }}>
                        {error || "User not found"}
                    </h2>
                    <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                        <button className="back-btn" onClick={() => navigate('/feed')}>
                            ← Back to Feed
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    const totalLikes = posts.reduce((acc, curr) => acc + (curr.likes || 0), 0);

    return (
        <div className="profile-page">
            <div className="profile-container">
                {/* Top Navigation Bar */}
                <div className="profile-top-bar">
                    <button className="back-btn" onClick={() => navigate('/feed')}>
                        ← Back to Feed
                    </button>
                    <button className="back-btn" onClick={() => navigate('/create-post')}>
                        ➕ Create Post
                    </button>
                </div>

                {/* Hero Card */}
                <div className="profile-hero">
                    <div className="hero-main">
                        <div className="avatar-wrapper">
                            {profileUser.avatar ? (
                                <img
                                    src={profileUser.avatar}
                                    alt={profileUser.username}
                                    className="avatar-img"
                                />
                            ) : (
                                <div className="avatar-placeholder">
                                    {profileUser.username?.charAt(0) || "U"}
                                </div>
                            )}
                        </div>

                        <div className="user-info">
                            <div className="user-names">
                                <h2>{profileUser.username}</h2>
                                <span className="user-email">{profileUser.email}</span>
                            </div>

                            <div className={`user-bio ${!profileUser.bio ? 'empty-bio' : ''}`}>
                                {profileUser.bio || "No bio yet. Click 'Edit Profile' to add a bio!"}
                            </div>

                            <div className="stats-row">
                                <div className="stat-item">
                                    <span className="stat-value">{posts.length}</span>
                                    <span className="stat-label">Posts</span>
                                </div>
                                <div className="stat-item">
                                    <span className="stat-value">{totalLikes}</span>
                                    <span className="stat-label">Total Likes</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Actions Bar */}
                    <div className="hero-actions">
                        <button
                            className="btn btn-primary"
                            onClick={() => setIsEditing(true)}
                        >
                            ✏️ Edit Profile
                        </button>
                        <button
                            className="btn btn-secondary"
                            onClick={() => navigate('/create-post')}
                        >
                            ➕ Create Post
                        </button>
                        <button
                            className="btn btn-danger"
                            onClick={onLogout}
                        >
                            🚪 Logout
                        </button>
                    </div>
                </div>

                {/* Edit Profile Modal */}
                {isEditing && (
                    <div className="edit-modal-overlay" onClick={() => setIsEditing(false)}>
                        <div className="edit-modal" onClick={(e) => e.stopPropagation()}>
                            <div className="modal-header">
                                <h3>Edit Profile</h3>
                                <button className="close-btn" onClick={() => setIsEditing(false)}>
                                    &times;
                                </button>
                            </div>

                            <form onSubmit={handleUpdateSubmit}>
                                <div className="form-group">
                                    <label htmlFor="edit-username">Username</label>
                                    <input
                                        id="edit-username"
                                        type="text"
                                        value={editUsername}
                                        onChange={(e) => setEditUsername(e.target.value)}
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="edit-bio">Bio</label>
                                    <textarea
                                        id="edit-bio"
                                        placeholder="Tell us about yourself..."
                                        value={editBio}
                                        onChange={(e) => setEditBio(e.target.value)}
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="edit-avatar">Profile Picture</label>
                                    <input
                                        id="edit-avatar"
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => setAvatarFile(e.target.files[0])}
                                    />
                                </div>

                                <div className="modal-buttons">
                                    <button
                                        type="button"
                                        className="btn-cancel"
                                        onClick={() => setIsEditing(false)}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="btn-save"
                                        disabled={updating}
                                    >
                                        {updating ? "Saving..." : "Save Changes"}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Posts Section */}
                <div className="profile-posts-section">
                    <div className="posts-header">
                        <h3>🖼️ My Posts ({posts.length})</h3>
                    </div>

                    {posts.length > 0 ? (
                        <div className="posts-grid">
                            {posts.map((post) => (
                                <div key={post._id} className="grid-post-card">
                                    <img src={post.image} alt={post.caption || "Post"} />
                                    <div className="post-overlay">
                                        <span className="likes-count">❤️ {post.likes || 0}</span>
                                        {post.caption && (
                                            <p className="post-caption">{post.caption}</p>
                                        )}
                                        <button
                                            className="delete-post-btn"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleDeletePost(post._id);
                                            }}
                                            disabled={deletingPostId === post._id}
                                            title="Delete this post"
                                        >
                                            {deletingPostId === post._id ? (
                                                <span>Deleting...</span>
                                            ) : (
                                                <>
                                                    <span className="trash-icon">🗑️</span>
                                                    <span>Delete</span>
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="empty-posts">
                            <div className="empty-icon">📷</div>
                            <h4>No posts yet</h4>
                            <p>Share your favorite photos and memories with the world!</p>
                            <button
                                className="btn-create"
                                onClick={() => navigate('/create-post')}
                            >
                                Create Your First Post
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Profile;
