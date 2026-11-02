import { useState, useEffect } from 'react';
import { getUserProfile, getUserPosts, updateProfile } from '../api';

export default function ProfileView({ username, currentUserId, onStartChat, onBackToMyProfile }) {
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [bioInput, setBioInput] = useState('');
  const [isSavingBio, setIsSavingBio] = useState(false);

  const isMe = username === currentUserId;

  const loadData = () => {
    setLoading(true);
    Promise.all([getUserProfile(username), getUserPosts(username)])
      .then(([profileRes, postsRes]) => {
        setProfile(profileRes.data);
        setBioInput(profileRes.data.bio || '');
        setPosts(postsRes.data || []);
      })
      .catch((err) => {
        console.error('Failed to load profile:', err);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    loadData();
    setIsEditingBio(false);
  }, [username]);

  const handleSaveBio = async () => {
    setIsSavingBio(true);
    try {
      const res = await updateProfile(bioInput);
      setProfile((prev) => ({ ...prev, bio: res.data.bio }));
      setIsEditingBio(false);
    } catch (err) {
      alert('Failed to update bio');
    } finally {
      setIsSavingBio(false);
    }
  };

  if (loading) {
    return (
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#666' }}>
        Loading profile...
      </div>
    );
  }

  if (!profile) {
    return (
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
        <div>User not found.</div>
        {!isMe && (
          <button
            onClick={onBackToMyProfile}
            style={{
              padding: '6px 14px',
              fontSize: 12,
              border: '1px solid #000',
              borderRadius: 3,
              background: '#000',
              color: '#fff',
              cursor: 'pointer'
            }}
          >
            Back to my profile
          </button>
        )}
      </div>
    );
  }

  const joinDate = profile.createdAt
    ? new Date(profile.createdAt).toLocaleDateString([], {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    : 'Unknown';

  const totalLikes = posts.reduce((sum, p) => sum + (p.likedBy?.length || 0), 0);

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
        {/* Navigation back if viewing other user */}
        {!isMe && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <button
              onClick={onBackToMyProfile}
              style={{
                padding: '6px 14px',
                fontSize: 12,
                fontWeight: 600,
                border: '1px solid #000',
                borderRadius: 4,
                background: '#fff',
                cursor: 'pointer'
              }}
            >
              ← Back to My Profile
            </button>
            <button
              onClick={() => onStartChat(username)}
              style={{
                padding: '6px 16px',
                fontSize: 12,
                fontWeight: 700,
                border: '1px solid #000',
                borderRadius: 4,
                background: '#000',
                color: '#fff',
                cursor: 'pointer'
              }}
            >
              💬 Message @{username}
            </button>
          </div>
        )}

        {/* Profile Card */}
        <div style={{
          background: '#ffffff',
          border: '1px solid #000',
          borderRadius: 6,
          padding: '28px 24px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.04)',
          display: 'flex',
          flexDirection: 'column',
          gap: 18
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
            <div style={{
              width: 64,
              height: 64,
              borderRadius: '50%',
              background: '#000',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 26,
              fontWeight: 800
            }}>
              {profile.username ? profile.username.charAt(0).toUpperCase() : 'U'}
            </div>

            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <h2 style={{ margin: 0, fontSize: 22, fontWeight: 900 }}>
                  @{profile.username}
                </h2>
                {isMe && (
                  <span style={{
                    fontSize: 11,
                    padding: '2px 8px',
                    border: '1px solid #000',
                    borderRadius: 3,
                    background: '#000',
                    color: '#fff',
                    fontWeight: 600
                  }}>
                    YOU
                  </span>
                )}
              </div>

              {profile.email && (
                <div style={{ fontSize: 13, color: '#555', marginTop: 4 }}>
                  <span style={{ fontWeight: 600 }}>Email:</span> {profile.email}
                </div>
              )}

              <div style={{ fontSize: 12, color: '#888', marginTop: 2 }}>
                Member since {joinDate}
              </div>
            </div>
          </div>

          {/* Stats Bar */}
          <div style={{
            display: 'flex',
            gap: 20,
            borderTop: '1px solid #eee',
            borderBottom: '1px solid #eee',
            padding: '12px 0'
          }}>
            <div>
              <span style={{ fontWeight: 800, fontSize: 16 }}>{posts.length}</span>{' '}
              <span style={{ fontSize: 13, color: '#666' }}>Posts</span>
            </div>
            <div>
              <span style={{ fontWeight: 800, fontSize: 16 }}>{totalLikes}</span>{' '}
              <span style={{ fontSize: 13, color: '#666' }}>Likes Received</span>
            </div>
          </div>

          {/* Bio Section */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <span style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', color: '#666' }}>
                Bio
              </span>
              {isMe && !isEditingBio && (
                <button
                  onClick={() => setIsEditingBio(true)}
                  style={{
                    padding: '3px 8px',
                    fontSize: 11,
                    fontWeight: 600,
                    border: '1px solid #000',
                    borderRadius: 3,
                    background: '#fff',
                    cursor: 'pointer'
                  }}
                >
                  Edit Bio
                </button>
              )}
            </div>

            {isEditingBio ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <textarea
                  value={bioInput}
                  onChange={(e) => setBioInput(e.target.value)}
                  placeholder="Tell others a little about yourself..."
                  rows={3}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    fontSize: 13,
                    borderRadius: 4,
                    border: '1px solid #000',
                    outline: 'none',
                    fontFamily: 'inherit'
                  }}
                />
                <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                  <button
                    onClick={() => {
                      setIsEditingBio(false);
                      setBioInput(profile.bio || '');
                    }}
                    style={{
                      padding: '5px 12px',
                      fontSize: 12,
                      border: '1px solid #000',
                      borderRadius: 3,
                      background: '#fff',
                      cursor: 'pointer'
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveBio}
                    disabled={isSavingBio}
                    style={{
                      padding: '5px 14px',
                      fontSize: 12,
                      fontWeight: 700,
                      border: '1px solid #000',
                      borderRadius: 3,
                      background: '#000',
                      color: '#fff',
                      cursor: 'pointer'
                    }}
                  >
                    {isSavingBio ? 'Saving...' : 'Save'}
                  </button>
                </div>
              </div>
            ) : (
              <div style={{ fontSize: 14, color: profile.bio ? '#111' : '#888', fontStyle: profile.bio ? 'normal' : 'italic' }}>
                {profile.bio || 'No bio added yet.'}
              </div>
            )}
          </div>
        </div>

        {/* User's Posts */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{
            fontSize: 14,
            fontWeight: 800,
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            color: '#111'
          }}>
            Posts by @{profile.username} ({posts.length})
          </div>

          {posts.length === 0 ? (
            <div style={{
              background: '#fff',
              border: '1px solid #000',
              borderRadius: 6,
              padding: '24px',
              textAlign: 'center',
              color: '#666',
              fontSize: 13
            }}>
              No posts published yet.
            </div>
          ) : (
            posts.map((post) => (
              <div
                key={post.id}
                style={{
                  background: '#ffffff',
                  border: '1px solid #000',
                  borderRadius: 6,
                  padding: '16px 18px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 10
                }}
              >
                <div style={{ fontSize: 12, color: '#777' }}>
                  {post.createdAt ? new Date(post.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : ''}
                </div>
                <div style={{ fontSize: 14, lineHeight: '1.5', color: '#111', whiteSpace: 'pre-wrap' }}>
                  {post.content}
                </div>
                <div style={{ fontSize: 12, color: '#555', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span>❤️</span> {post.likedBy?.length || 0} likes
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

