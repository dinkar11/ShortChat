import { useState, useEffect } from 'react';
import Navbar from './components/Navbar.jsx';
import HomeView from './components/HomeView.jsx';
import ProfileView from './components/ProfileView.jsx';
import MessageList from './components/MessageList.jsx';
import MessageInput from './components/MessageInput.jsx';
import AuthView from './components/AuthView.jsx';
import useConversation from './hooks/useConversation.js';
import { getMe, setAuthToken, createOrGetSession, deleteSession, logoutApi, getMySessions } from './api';

export default function App() {
  const [myId, setMyId] = useState('');
  const [activeTab, setActiveTab] = useState('home'); // 'home' | 'messages' | 'profile'
  const [viewedProfileUser, setViewedProfileUser] = useState('');
  const [otherId, setOtherId] = useState('');
  const [sessionId, setSessionId] = useState('');
  const [recentSessions, setRecentSessions] = useState([]);
  const [isFullscreen, setIsFullscreen] = useState(Boolean(document.fullscreenElement));

  useEffect(() => {
    getMe()
      .then((res) => {
        setMyId(res.data.username);
        setViewedProfileUser(res.data.username);
      })
      .catch(() => setMyId(''));

    const onFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };

    document.addEventListener('fullscreenchange', onFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', onFullscreenChange);
  }, []);

  const fetchUserSessions = () => {
    getMySessions()
      .then((res) => setRecentSessions(res.data || []))
      .catch(() => setRecentSessions([]));
  };

  useEffect(() => {
    if (myId && activeTab === 'messages') {
      fetchUserSessions();
    }
  }, [myId, activeTab]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((err) => {
        console.error('Fullscreen request failed:', err);
      });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch((err) => {
          console.error('Exit fullscreen failed:', err);
        });
      }
    }
  };

  const handleStartChat = async (targetUser) => {
    if (!targetUser || targetUser === myId) return;
    setOtherId(targetUser);
    setActiveTab('messages');
    try {
      const res = await createOrGetSession(targetUser);
      setSessionId(res.data.id);
      fetchUserSessions();
    } catch (e) {
      console.error('Session error:', e);
    }
  };

  const handleSelectOtherId = async (id) => {
    if (!id || id === myId) {
      setOtherId('');
      setSessionId('');
      return;
    }
    handleStartChat(id);
  };

  const handleLogout = () => {
    logoutApi().finally(() => {
      setAuthToken(null);
      setMyId('');
      setOtherId('');
      setSessionId('');
      setActiveTab('home');
    });
  };

  const handleViewProfile = (username) => {
    setViewedProfileUser(username || myId);
    setActiveTab('profile');
  };

  const ready = myId && otherId && sessionId;
  const { messages, send, clear } = useConversation(myId, otherId, sessionId);

  // When session completes, chat and session are permanently deleted from database
  const handleCompleteSession = async () => {
    const ok = window.confirm(
      `Complete and delete session "${sessionId}"?\n\nAll messages between @${myId} and @${otherId} will be permanently wiped from the database.`
    );
    if (!ok) return;

    try {
      await deleteSession(sessionId);
      clear();
      setOtherId('');
      setSessionId('');
      fetchUserSessions();
      alert('Session completed and chat history permanently deleted.');
    } catch (e) {
      console.error('Failed to complete session:', e);
      alert('Failed to complete session');
    }
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      width: '100%',
      maxWidth: '100%',
      margin: 0,
      padding: 0,
      background: '#fff',
      color: '#000',
      overflow: 'hidden',
      position: 'relative'
    }}>
      {!myId ? (
        <div style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
          height: '100%',
          background: '#ffffff',
          position: 'relative'
        }}>
          <button
            onClick={toggleFullscreen}
            title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
            style={{
              position: 'absolute',
              top: 16,
              right: 20,
              padding: '6px 14px',
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
          <AuthView onLoginSuccess={(user) => {
            setMyId(user);
            setViewedProfileUser(user);
          }} />
        </div>
      ) : (
        <>
          {/* Main Top Navbar */}
          <Navbar
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            myId={myId}
            onLogout={handleLogout}
            onStartChat={handleStartChat}
            onViewProfile={handleViewProfile}
            isFullscreen={isFullscreen}
            onToggleFullscreen={toggleFullscreen}
          />

          {/* Tab 1: Home View (Post creation and feed) */}
          {activeTab === 'home' && (
            <HomeView
              myId={myId}
              onStartChat={handleStartChat}
              onViewProfile={handleViewProfile}
            />
          )}

          {/* Tab 2: Profile View */}
          {activeTab === 'profile' && (
            <ProfileView
              username={viewedProfileUser || myId}
              currentUserId={myId}
              onStartChat={handleStartChat}
              onBackToMyProfile={() => setViewedProfileUser(myId)}
            />
          )}

          {/* Tab 3: Messages View (1-to-1 Ephemeral Chat) */}
          {activeTab === 'messages' && (
            <div style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              width: '100%',
              overflow: 'hidden'
            }}>
              {ready ? (
                <>
                  {/* Chat Session Bar with "Complete Session" Deletion action */}
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '10px 24px',
                    background: '#f8f8f8',
                    borderBottom: '1px solid #000',
                    width: '100%',
                    flexWrap: 'wrap',
                    gap: 10
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <button
                        onClick={() => {
                          setOtherId('');
                          setSessionId('');
                        }}
                        style={{
                          padding: '4px 10px',
                          fontSize: 12,
                          fontWeight: 600,
                          borderRadius: 3,
                          border: '1px solid #000',
                          background: '#fff',
                          cursor: 'pointer'
                        }}
                      >
                        ← All Chats
                      </button>

                      <div>
                        <div style={{ fontSize: 14, fontWeight: 700 }}>
                          Chatting with @{otherId}
                          <span style={{ fontWeight: 400, color: '#666', marginLeft: 10 }}>
                            ({messages.length} messages)
                          </span>
                        </div>
                        <div style={{ fontSize: 11, color: '#555', fontFamily: 'monospace', marginTop: 2 }}>
                          Session: {sessionId} (Ephemeral)
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <button
                        onClick={handleCompleteSession}
                        title="Complete session and delete all messages from database"
                        style={{
                          padding: '6px 14px',
                          fontSize: 12,
                          fontWeight: 700,
                          borderRadius: 3,
                          border: '1px solid #d32f2f',
                          background: '#d32f2f',
                          color: '#fff',
                          cursor: 'pointer'
                        }}
                      >
                        Complete & Delete Chat
                      </button>
                    </div>
                  </div>

                  {/* Message Stream */}
                  <div style={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    width: '100%',
                    overflow: 'hidden'
                  }}>
                    <MessageList messages={messages} myId={myId} />
                  </div>

                  {/* Message Input */}
                  <MessageInput onSend={send} disabled={!ready} />
                </>
              ) : (
                /* No Active Chat Selected */
                <div style={{
                  flex: 1,
                  overflowY: 'auto',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  padding: '40px 20px',
                  background: '#fafafa',
                  width: '100%'
                }}>
                  <div style={{
                    maxWidth: 580,
                    width: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 20
                  }}>
                    <div style={{
                      background: '#fff',
                      border: '1px solid #000',
                      borderRadius: 6,
                      padding: '30px 24px',
                      textAlign: 'center'
                    }}>
                      <div style={{ fontSize: 36, marginBottom: 8 }}>💬</div>
                      <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800 }}>
                        Ephemeral 1-to-1 Messaging
                      </h2>
                      <p style={{ fontSize: 13, color: '#666', margin: '10px 0 0 0', lineHeight: '1.6' }}>
                        Search any username using the search bar at the top or click <strong>"Message"</strong> on any user's post or profile to begin chatting.
                      </p>
                      <p style={{ fontSize: 12, color: '#888', margin: '8px 0 0 0' }}>
                        Once you complete a session, all messages are permanently wiped from the database.
                      </p>
                    </div>

                    {/* Active Sessions List */}
                    {recentSessions.length > 0 && (
                      <div style={{
                        background: '#fff',
                        border: '1px solid #000',
                        borderRadius: 6,
                        padding: '18px 20px'
                      }}>
                        <div style={{
                          fontSize: 13,
                          fontWeight: 800,
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px',
                          marginBottom: 12
                        }}>
                          Active Sessions ({recentSessions.length})
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                          {recentSessions.map((s) => {
                            const partner = s.userA === myId ? s.userB : s.userA;
                            return (
                              <div
                                key={s.id}
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'space-between',
                                  padding: '10px 12px',
                                  border: '1px solid #eee',
                                  borderRadius: 4,
                                  background: '#fafafa'
                                }}
                              >
                                <div>
                                  <div style={{ fontWeight: 700, fontSize: 14 }}>
                                    @{partner}
                                  </div>
                                  <div style={{ fontSize: 11, color: '#666', fontFamily: 'monospace' }}>
                                    ID: {s.id}
                                  </div>
                                </div>
                                <button
                                  onClick={() => handleSelectOtherId(partner)}
                                  style={{
                                    padding: '6px 14px',
                                    fontSize: 12,
                                    fontWeight: 600,
                                    borderRadius: 3,
                                    border: '1px solid #000',
                                    background: '#000',
                                    color: '#fff',
                                    cursor: 'pointer'
                                  }}
                                >
                                  Open Chat
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
