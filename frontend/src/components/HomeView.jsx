import { useState, useEffect } from 'react';
import { getPosts, createPost, toggleLikePost, deletePost } from '../api';

export default function HomeView({ myId, onStartChat, onViewProfile }) {
  const [posts, setPosts] = useState([]);
  const [content, setContent] = useState('');
  const [isPosting, setIsPosting] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchPosts = () => {
    getPosts()
      .then((res) => setPosts(res.data || []))
      .catch((err) => console.error('Error fetching posts:', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!content.trim() || isPosting) return;

    setIsPosting(true);
    try {
      const res = await createPost(content.trim());
      setPosts([res.data, ...posts]);
      setContent('');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to publish post');
    } finally {
      setIsPosting(false);
    }
  };

  const handleLike = async (postId) => {
    try {
      const res = await toggleLikePost(postId);
      setPosts(posts.map((p) => (p.id === postId ? res.data : p)));
    } catch (err) {
      console.error('Failed to toggle like:', err);
    }
  };

  const handleDelete = async (postId) => {
    if (!window.confirm('Delete this post?')) return;
    try {
      await deletePost(postId);
      setPosts(posts.filter((p) => p.id !== postId));
    } catch (err) {
      alert('Failed to delete post');
    }
  };

  return (
    <div style={{
      flex: 1,
      overflowY: 'auto',
      padding: '24px 20px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      background: '#fafafa',
      width: '100%'
    }}>
      <div style={{ width: '100%', maxWidth: 680, display: 'flex', flexDirection: 'column', gap: 20 }}>
        {/* Post Composer */}
        <div style={{
          background: '#ffffff',
          border: '1px solid #000',
          borderRadius: 6,
          padding: 18,
          boxShadow: '0 2px 4px rgba(0,0,0,0.04)'
        }}>
          <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 10, color: '#333' }}>
            Publish a post to the feed
          </div>
          <form onSubmit={handleCreatePost}>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={`What's on your mind, @${myId}?`}
              rows={3}
              style={{
                width: '100%',
                padding: '12px 14px',
                fontSize: 14,
                borderRadius: 4,
                border: '1px solid #000',
                outline: 'none',
                resize: 'vertical',
                fontFamily: 'inherit',
                marginBottom: 12
              }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 12, color: '#888' }}>
                {content.length}/1000 characters
              </span>
              <button
                type="submit"
                disabled={!content.trim() || isPosting}
                style={{
                  padding: '8px 22px',
                  fontSize: 13,
                  fontWeight: 700,
                  borderRadius: 4,
                  border: '1px solid #000',
                  background: !content.trim() || isPosting ? '#e0e0e0' : '#000',
                  color: !content.trim() || isPosting ? '#888' : '#fff',
                  cursor: !content.trim() || isPosting ? 'not-allowed' : 'pointer'
                }}
              >
                {isPosting ? 'Publishing...' : 'Publish Post'}
              </button>
            </div>
          </form>
        </div>

        {/* Feed Stream */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{
            fontSize: 14,
            fontWeight: 800,
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            color: '#111',
            marginTop: 8
          }}>
            Latest Posts
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: '#666', fontSize: 14 }}>
              Loading posts...
            </div>
          ) : posts.length === 0 ? (
            <div style={{
              background: '#fff',
              border: '1px solid #000',
              borderRadius: 6,
              padding: '36px 20px',
              textAlign: 'center',
              color: '#666'
            }}>
              <div style={{ fontSize: 16, fontWeight: 700, color: '#000', marginBottom: 4 }}>
                No posts yet
              </div>
              <div style={{ fontSize: 13 }}>
                Be the first to publish a post to the feed above!
              </div>
            </div>
          ) : (
            posts.map((post) => {
              const isAuthor = post.authorUsername === myId;
              const liked = post.likedBy?.includes(myId);
              const dateStr = post.createdAt
                ? new Date(post.createdAt).toLocaleDateString([], {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })
                : '';

              return (
                <div
                  key={post.id}
                  style={{
                    background: '#ffffff',
                    border: '1px solid #000',
                    borderRadius: 6,
                    padding: '16px 18px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 12,
                    boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
                  }}
                >
                  {/* Author Header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div
                        onClick={() => onViewProfile(post.authorUsername)}
                        style={{
                          width: 34,
                          height: 34,
                          borderRadius: '50%',
                          background: '#000',
                          color: '#fff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: 14,
                          fontWeight: 700,
                          cursor: 'pointer'
                        }}
                      >
                        {post.authorUsername ? post.authorUsername.charAt(0).toUpperCase() : 'U'}
                      </div>
                      <div>
                        <div
                          onClick={() => onViewProfile(post.authorUsername)}
                          style={{
                            fontSize: 14,
                            fontWeight: 700,
                            cursor: 'pointer',
                            color: '#000'
                          }}
                        >
                          @{post.authorUsername}
                        </div>
                        <div style={{ fontSize: 11, color: '#777' }}>
                          {dateStr}
                        </div>
                      </div>
                    </div>

                    {isAuthor && (
                      <button
                        onClick={() => handleDelete(post.id)}
                        style={{
                          padding: '4px 10px',
                          fontSize: 11,
                          fontWeight: 600,
                          borderRadius: 3,
                          border: '1px solid #ff4444',
                          background: '#fff',
                          color: '#ff4444',
                          cursor: 'pointer'
                        }}
                      >
                        Delete
                      </button>
                    )}
                  </div>

                  {/* Post Content */}
                  <div style={{
                    fontSize: 14,
                    lineHeight: '1.6',
                    color: '#111',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word'
                  }}>
                    {post.content}
                  </div>

                  {/* Actions Bar */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    borderTop: '1px solid #f0f0f0',
                    paddingTop: 10
                  }}>
                    <button
                      onClick={() => handleLike(post.id)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                        padding: '5px 12px',
                        fontSize: 12,
                        fontWeight: 600,
                        borderRadius: 3,
                        border: '1px solid #000',
                        background: liked ? '#000' : '#fff',
                        color: liked ? '#fff' : '#000',
                        cursor: 'pointer'
                      }}
                    >
                      <span>{liked ? '❤️' : '🤍'}</span>
                      <span>{post.likedBy?.length || 0}</span>
                    </button>

                    {!isAuthor && (
                      <button
                        onClick={() => onStartChat(post.authorUsername)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 6,
                          padding: '5px 12px',
                          fontSize: 12,
                          fontWeight: 600,
                          borderRadius: 3,
                          border: '1px solid #000',
                          background: '#fff',
                          color: '#000',
                          cursor: 'pointer'
                        }}
                      >
                        <span>💬</span> Message @{post.authorUsername}
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

