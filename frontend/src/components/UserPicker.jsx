const USERS = ['alice', 'bob', 'carol', 'dave'];

export default function UserPicker({ myId, otherId, onOtherId, onLogout, isFullscreen, onToggleFullscreen }) {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '14px 24px',
      borderBottom: '1px solid #000',
      background: '#fff',
      width: '100%'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
        <span style={{
          fontSize: 18,
          fontWeight: 900,
          letterSpacing: '-0.5px'
        }}>
          ShortChat
        </span>

        <span style={{
          fontSize: 12,
          padding: '3px 10px',
          border: '1px solid #000',
          borderRadius: 3,
          fontWeight: 600,
          background: '#000',
          color: '#fff'
        }}>
          {myId}
        </span>

        <label style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          fontSize: 14,
          fontWeight: 500
        }}>
          Chat with:
          <select
            value={otherId}
            onChange={(e) => onOtherId(e.target.value)}
            style={{
              padding: '6px 12px',
              fontSize: 13,
              borderRadius: 3,
              border: '1px solid #000',
              background: '#fff',
              color: '#000',
              outline: 'none',
              cursor: 'pointer'
            }}
          >
            <option value="">Select user...</option>
            {USERS.filter((user) => user !== myId).map((user) => (
              <option key={user} value={user}>{user}</option>
            ))}
          </select>
        </label>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        {onToggleFullscreen && (
          <button
            onClick={onToggleFullscreen}
            title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
            style={{
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
        )}

        <button
          onClick={onLogout}
          style={{
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
          Sign out
        </button>
      </div>
    </div>
  );
}
