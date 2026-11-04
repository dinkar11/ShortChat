import { useState } from 'react';
import { login, register, setAuthToken, getRandomUsername, forgotPassword, resetPassword } from '../api';

export default function AuthView({ onLoginSuccess }) {
  // Modes: 'login' | 'register' | 'forgot_request' | 'forgot_reset'
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  // Forgot password fields
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [devOtpHint, setDevOtpHint] = useState('');

  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [isRollingUsername, setIsRollingUsername] = useState(false);

  const switchMode = (newMode) => {
    setMode(newMode);
    setError('');
    setSuccessMsg('');
  };

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
    setSuccessMsg('');
    setLoading(true);

    try {
      let res;
      if (mode === 'register') {
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

  const handleSendOtp = async (e) => {
    if (e) e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!email.trim()) {
      setError('Please enter your registered email address.');
      return;
    }

    setLoading(true);
    try {
      const res = await forgotPassword(email.trim());
      setSuccessMsg(res.data?.message || `A verification code was sent to ${email.trim()}`);
      if (res.data?.devOtp) {
        setDevOtpHint(res.data.devOtp);
      }
      setMode('forgot_reset');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send OTP. Please verify your email.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!otp.trim()) {
      setError('Please enter the 6-digit OTP code.');
      return;
    }

    if (!newPassword) {
      setError('Please enter a new password.');
      return;
    }

    if (newPassword.length < 4) {
      setError('Password must be at least 4 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const res = await resetPassword(email.trim(), otp.trim(), newPassword);
      setSuccessMsg(res.data?.message || 'Password reset successfully! Please sign in with your new password.');
      setPassword('');
      setOtp('');
      setNewPassword('');
      setConfirmPassword('');
      setDevOtpHint('');
      setMode('login');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reset password. Please check your code.');
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

      {/* Success Notification */}
      {successMsg && (
        <div style={{
          fontSize: 13,
          color: '#155724',
          background: '#d4edda',
          padding: '10px 12px',
          border: '1px solid #c3e6cb',
          borderRadius: 3
        }}>
          {successMsg}
        </div>
      )}

      {/* Error Notification */}
      {error && (
        <div style={{
          fontSize: 13,
          color: '#d32f2f',
          background: '#ffebee',
          padding: '10px 12px',
          border: '1px solid #d32f2f',
          borderRadius: 3
        }}>
          {error}
        </div>
      )}

      {/* 1. LOGIN & REGISTER MODES */}
      {(mode === 'login' || mode === 'register') && (
        <form
          onSubmit={handleAuth}
          style={{ display: 'flex', flexDirection: 'column', gap: 14 }}
        >
          {mode === 'register' ? (
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
                placeholder="e.g. example@gmail.com or your_username"
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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label style={{ fontSize: 13, fontWeight: 700, color: '#000' }}>
                Password
              </label>
              {mode === 'login' && (
                <button
                  type="button"
                  onClick={() => switchMode('forgot_request')}
                  style={{
                    background: 'none',
                    border: 'none',
                    fontSize: 12,
                    color: '#666',
                    textDecoration: 'underline',
                    cursor: 'pointer',
                    padding: 0
                  }}
                >
                  Forgot password?
                </button>
              )}
            </div>
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
            {loading ? 'Please wait...' : mode === 'register' ? 'Create Account' : 'Sign In'}
          </button>

          <div style={{ textAlign: 'center', marginTop: 4 }}>
            <button
              type="button"
              onClick={() => switchMode(mode === 'register' ? 'login' : 'register')}
              style={{
                background: 'none',
                border: 'none',
                fontSize: 13,
                color: '#000',
                textDecoration: 'underline',
                cursor: 'pointer'
              }}
            >
              {mode === 'register'
                ? 'Already have an account? Sign In'
                : "Don't have an account? Register"}
            </button>
          </div>
        </form>
      )}

      {/* 2. FORGOT PASSWORD - STEP 1: REQUEST OTP */}
      {mode === 'forgot_request' && (
        <form
          onSubmit={handleSendOtp}
          style={{ display: 'flex', flexDirection: 'column', gap: 14 }}
        >
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 800, margin: '0 0 6px 0' }}>
              Reset Password
            </h2>
            <p style={{ fontSize: 13, color: '#666', margin: 0, lineHeight: 1.4 }}>
              Enter your registered account email and we'll send you a 6-digit OTP code to verify and set a new password.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <label style={{ fontSize: 13, fontWeight: 700, color: '#000' }}>
              Registered Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              autoFocus
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
            {loading ? 'Sending code...' : 'Send Verification OTP'}
          </button>

          <div style={{ textAlign: 'center', marginTop: 4 }}>
            <button
              type="button"
              onClick={() => switchMode('login')}
              style={{
                background: 'none',
                border: 'none',
                fontSize: 13,
                color: '#000',
                textDecoration: 'underline',
                cursor: 'pointer'
              }}
            >
              ← Back to Sign In
            </button>
          </div>
        </form>
      )}

      {/* 3. FORGOT PASSWORD - STEP 2: VERIFY OTP & RESET */}
      {mode === 'forgot_reset' && (
        <form
          onSubmit={handleResetPassword}
          style={{ display: 'flex', flexDirection: 'column', gap: 14 }}
        >
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 800, margin: '0 0 6px 0' }}>
              Enter Verification Code
            </h2>
            <p style={{ fontSize: 13, color: '#666', margin: 0, lineHeight: 1.4 }}>
              Enter the 6-digit OTP code sent to <strong>{email}</strong> and choose your new password.
            </p>
          </div>

          {devOtpHint && (
            <div style={{
              fontSize: 12,
              color: '#1b5e20',
              background: '#e8f5e9',
              border: '1px solid #c8e6c9',
              padding: '8px 12px',
              borderRadius: 3
            }}>
              💡 <strong>Development OTP:</strong> <code>{devOtpHint}</code>
            </div>
          )}

          {/* OTP input */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label style={{ fontSize: 13, fontWeight: 700, color: '#000' }}>
                6-Digit OTP Code
              </label>
              <button
                type="button"
                onClick={handleSendOtp}
                disabled={loading}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: 12,
                  color: '#666',
                  textDecoration: 'underline',
                  cursor: 'pointer',
                  padding: 0
                }}
              >
                Resend Code
              </button>
            </div>
            <input
              type="text"
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
              placeholder="123456"
              required
              autoFocus
              style={{
                padding: '10px 12px',
                fontSize: 18,
                fontWeight: 700,
                letterSpacing: '4px',
                textAlign: 'center',
                borderRadius: 3,
                border: '1px solid #000',
                outline: 'none',
                background: '#f8f8f8'
              }}
            />
          </div>

          {/* New Password */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <label style={{ fontSize: 13, fontWeight: 700, color: '#000' }}>
              New Password
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
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

          {/* Confirm Password */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <label style={{ fontSize: 13, fontWeight: 700, color: '#000' }}>
              Confirm New Password
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
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
            {loading ? 'Resetting password...' : 'Update Password'}
          </button>

          <div style={{ textAlign: 'center', marginTop: 4 }}>
            <button
              type="button"
              onClick={() => switchMode('login')}
              style={{
                background: 'none',
                border: 'none',
                fontSize: 13,
                color: '#000',
                textDecoration: 'underline',
                cursor: 'pointer'
              }}
            >
              ← Back to Sign In
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
