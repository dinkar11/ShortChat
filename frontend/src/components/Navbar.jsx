import { useState, useEffect, useRef } from 'react';
import { searchUsers } from '../api';

export default function Navbar({
  activeTab,
  setActiveTab,
  myId,
  unreadCount = 0,
  onLogout,
  onStartChat,
  onViewProfile,
  isFullscreen,
  onToggleFullscreen
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const searchRef = useRef(null);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setShowDropdown(false);
      return;
    }

    const timer = setTimeout(() => {
      setIsSearching(true);
      searchUsers(searchQuery.trim())
        .then((res) => {
          setSearchResults(res.data || []);
          setShowDropdown(true);
        })
        .catch(() => {
          setSearchResults([]);
        })
        .finally(() => {
          setIsSearching(false);
        });
    }, 250);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Click outside listener to close dropdown
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '12px 24px',
      borderBottom: '1px solid #000',
      background: '#fff',
      width: '100%',
      position: 'relative',
      zIndex: 100,
      gap: 16,
      flexWrap: 'wrap'
    }}>
      {/* Brand & Main Tabs */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
        <div
          onClick={() => setActiveTab('home')}
          style={{
            fontSize: 20,
            fontWeight: 900,
            letterSpacing: '-0.5px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 6
          }}
        >
          <span>ShortChat</span>
        </div>

        <nav style={{ display: 'flex', gap: 6 }}>
          <button
            onClick={() => setActiveTab('home')}
            style={{
              padding: '6px 14px',
              fontSize: 13,
              fontWeight: 600,
              borderRadius: 4,
              border: '1px solid #000',
              background: activeTab === 'home' ? '#000' : '#fff',
              color: activeTab === 'home' ? '#fff' : '#000',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6
            }}
          >
            <span>🏠</span> Home
          </button>

          <button
            onClick={() => setActiveTab('messages')}
            style={{
              padding: '6px 14px',
              fontSize: 13,
              fontWeight: 600,
              borderRadius: 4,
              border: '1px solid #000',
              background: activeTab === 'messages' ? '#000' : '#fff',
              color: activeTab === 'messages' ? '#fff' : '#000',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              position: 'relative'
            }}
          >
            <span style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}>
              <span>💬</span>
              {unreadCount > 0 && (
                <span
                  title={`${unreadCount} unread message${unreadCount > 1 ? 's' : ''}`}
                  style={{
                    position: 'absolute',
                    top: -8,
                    right: -10,
                    background: '#e53935',
                    color: '#fff',
                    fontSize: 10,
                    fontWeight: 800,
                    borderRadius: 10,
                    minWidth: 17,
                    height: 17,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '0 4px',
                    lineHeight: 1,
                    border: '2px solid #fff',
                    boxShadow: '0 1px 4px rgba(0,0,0,0.25)'
                  }}
                >
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </span>
            Messages
          </button>

          <button
            onClick={() => {
              onViewProfile(myId);
              setActiveTab('profile');
            }}
            style={{
              padding: '6px 14px',
              fontSize: 13,
              fontWeight: 600,
              borderRadius: 4,
              border: '1px solid #000',
              background: activeTab === 'profile' ? '#000' : '#fff',
              color: activeTab === 'profile' ? '#fff' : '#000',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6
            }}
          >
            <span>👤</span> Profile
          </button>
        </nav>
      </div>

      {/* User Search Bar */}
      <div ref={searchRef} style={{ position: 'relative', flex: '1', maxWidth: 360, minWidth: 200 }}>
        <input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={() => { if (searchResults.length > 0) setShowDropdown(true); }}
          placeholder="Search anyone's username..."
          style={{
            width: '100%',
            padding: '7px 12px',
            paddingLeft: 30,
            fontSize: 13,
            borderRadius: 4,
            border: '1px solid #000',
            outline: 'none',
            background: '#fafafa',
            color: '#000'
          }}
        />
        <span style={{
          position: 'absolute',
          left: 10,
          top: '50%',
          transform: 'translateY(-50%)',
          fontSize: 13,
          color: '#888',
          pointerEvents: 'none'
        }}>
          🔍
        </span>

        {showDropdown && (
          <div style={{
            position: 'absolute',
            top: 'calc(100% + 4px)',
            left: 0,
            right: 0,
            background: '#ffffff',
            border: '1px solid #000',
            borderRadius: 4,
            boxShadow: '0 4px 14px rgba(0,0,0,0.1)',
            maxHeight: 300,
            overflowY: 'auto',
            zIndex: 200
          }}>
            {isSearching ? (
              <div style={{ padding: '12px', fontSize: 12, color: '#666', textAlign: 'center' }}>
                Searching...
              </div>
            ) : searchResults.length === 0 ? (
              <div style={{ padding: '12px', fontSize: 12, color: '#666', textAlign: 'center' }}>
                No users found matching "{searchQuery}"
              </div>
            ) : (
              searchResults.map((user) => (
                <div
                  key={user.username}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 14px',
                    borderBottom: '1px solid #eee'
                  }}
                >
                  <div style={{ overflow: 'hidden', paddingRight: 8 }}>
                    <div style={{ fontWeight: 700, fontSize: 13, color: '#000' }}>
                      @{user.username}
                    </div>
                    {user.email && (
                      <div style={{ fontSize: 11, color: '#666', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                        {user.email}
                      </div>
                    )}
                  </div>

                  <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                    <button
                      onClick={() => {
                        onViewProfile(user.username);
                        setShowDropdown(false);
                        setSearchQuery('');
                      }}
                      style={{
                        padding: '4px 8px',
                        fontSize: 11,
                        fontWeight: 600,
                        border: '1px solid #000',
                        borderRadius: 3,
                        background: '#fff',
                        cursor: 'pointer'
                      }}
                    >
                      Profile
                    </button>
                    <button
                      onClick={() => {
                        onStartChat(user.username);
                        setShowDropdown(false);
                        setSearchQuery('');
                      }}
                      style={{
                        padding: '4px 10px',
                        fontSize: 11,
                        fontWeight: 600,
                        border: '1px solid #000',
                        borderRadius: 3,
                        background: '#000',
                        color: '#fff',
                        cursor: 'pointer'
                      }}
                    >
                      💬 Chat
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Right Controls: User Badge, Fullscreen & Logout */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <span
          onClick={() => {
            onViewProfile(myId);
            setActiveTab('profile');
          }}
          title="Your username"
          style={{
            fontSize: 12,
            padding: '4px 10px',
            border: '1px solid #000',
            borderRadius: 3,
            fontWeight: 700,
            background: '#000',
            color: '#fff',
            cursor: 'pointer'
          }}
        >
          @{myId}
        </span>

        {onToggleFullscreen && (
          <button
            onClick={onToggleFullscreen}
            title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
            style={{
              padding: '6px 12px',
              fontSize: 12,
              fontWeight: 600,
              borderRadius: 3,
              border: '1px solid #000',
              background: '#fff',
              color: '#000',
              cursor: 'pointer'
            }}
          >
            {isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
          </button>
        )}

        <button
          onClick={onLogout}
          style={{
            padding: '6px 12px',
            fontSize: 12,
            fontWeight: 600,
            borderRadius: 3,
            border: '1px solid #000',
            background: '#fff',
            color: '#000',
            cursor: 'pointer'
          }}
        >
          Sign out
        </button>
      </div>
    </header>
  );
}

