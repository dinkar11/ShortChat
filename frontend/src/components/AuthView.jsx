import { useState } from 'react';
import { login, register, setAuthToken, getRandomUsername } from '../api';

export default function AuthView({ onLoginSuccess }) {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isRollingUsername, setIsRollingUsername] = useState(false);

  const handleRollRandom = async () => {
    setIsRollingUsername(true);
    try {
      const res = await getRandomUsername();
      setUsername(res.data.username);
    } catch (e) {
      console.error('Failed to get random username:', e);
    } finally {
      setIsRollingUsername(false);
    }
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      let res;
      if (isRegister) {
        if (!email.trim()) {
          setError('Email is required');
          setLoading(false);
          return;
        }
        res = await register(email.trim(), username.trim(), password);
      } else {
        // Login supports either email or username
        const identifier = email.trim() || username.trim();
        if (!identifier) {
          setError('Please enter your email or username');
          setLoading(false);
          return;
        }
        res = await login(identifier, password);
      }

      setAuthToken(res.data.token);
      onLoginSuccess(res.data.username);
    } catch (err) {
      setError(err.response?.data?.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      padding: '36px 28px',
      display: 'flex',
      flexDirection: 'column',
      gap: 20,
      maxWidth: 440,
      margin: 'auto',
      width: '100%'
    }}>
      <div style={{ textAlign: 'center' }}>
        <h1 style={{
          margin: 0,
          fontSize: 30,
          fontWeight: 900,
          letterSpacing: '-0.5px'
        }}>
          ShortChat
        </h1>
        <p style={{
          margin: '6px 0 0 0',
          fontSize: 13,
          color: '#666'
        }}>
          Home feed, personal profiles, and ephemeral 1-to-1 messaging
        </p>
      </div>

      {/* Main Auth Form */}
      <form
        onSubmit={handleAuth}
        style={{ display: 'flex', flexDirection: 'column', gap: 14 }}
      >
        {isRegister ? (
          <>
            {/* Register: Email */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <label style={{ fontSize: 13, fontWeight: 700, color: '#000' }}>
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                style={{
                  padding: '10px 12px',
                  fontSize: 14,
                  borderRadius: 3,
                  border: '1px solid #000',
                  outline: 'none',
                  background: '#f8f8f8'
                }}
              />
            </div>

            {/* Register: Username (Optional, unique, or random) */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label style={{ fontSize: 13, fontWeight: 700, color: '#000' }}>
                  Username <span style={{ color: '#666', fontWeight: 400 }}>(Optional & Unique)</span>
                </label>
                <button
                  type="button"
                  onClick={handleRollRandom}
                  disabled={isRollingUsername}
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    border: '1px solid #000',
                    borderRadius: 3,
                    background: '#fff',
                    padding: '2px 8px',
                    cursor: 'pointer'
                  }}
                >
                  🎲 Roll Random
                </button>
              </div>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Leave blank for an auto-generated username"
                style={{
                  padding: '10px 12px',
                  fontSize: 14,
                  borderRadius: 3,
                  border: '1px solid #000',
                  outline: 'none',
                  background: '#f8f8f8'
                }}
              />
              <span style={{ fontSize: 11, color: '#666' }}>
                Tip: If not specified, we'll generate a unique username for you automatically.
              </span>
            </div>
          </>
        ) : (
          /* Login: Email or Username */
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <label style={{ fontSize: 13, fontWeight: 700, color: '#000' }}>
              Email or Username
            </label>
            <input
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. aryancoder999@gmail.com or your_username"
              required
              style={{
                padding: '10px 12px',
                fontSize: 14,
                borderRadius: 3,
                border: '1px solid #000',
                outline: 'none',
                background: '#f8f8f8'
              }}
            />
          </div>
        )}

        {/* Password */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <label style={{ fontSize: 13, fontWeight: 700, color: '#000' }}>
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
            style={{
              padding: '10px 12px',
              fontSize: 14,
              borderRadius: 3,
              border: '1px solid #000',
              outline: 'none',
              background: '#f8f8f8'
            }}
          />
        </div>

        {error && (
          <div style={{
            fontSize: 13,
            color: '#d32f2f',
            background: '#ffebee',
            padding: '8px 12px',
            border: '1px solid #d32f2f',
            borderRadius: 3
          }}>
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          style={{
            marginTop: 4,
            padding: '11px',
            fontSize: 14,
            fontWeight: 700,
            background: loading ? '#888' : '#000',
            color: '#fff',
            border: '1px solid #000',
            borderRadius: 3,
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          {loading ? 'Please wait...' : isRegister ? 'Create Account' : 'Sign In'}
        </button>

        <div style={{ textAlign: 'center', marginTop: 4 }}>
          <button
            type="button"
            onClick={() => {
              setIsRegister(!isRegister);
              setError('');
            }}
            style={{
              background: 'none',
              border: 'none',
              fontSize: 13,
              color: '#000',
              textDecoration: 'underline',
              cursor: 'pointer'
            }}
          >
            {isRegister
              ? 'Already have an account? Sign In'
              : "Don't have an account? Register"}
          </button>
        </div>
      </form>
    </div>
  );
}
