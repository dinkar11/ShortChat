import { useState } from 'react';

export default function MessageInput({ onSend, disabled }) {
  const [text, setText] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setText('');
  };

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        display: 'flex',
        gap: 12,
        padding: '16px 32px',
        borderTop: '1px solid #000',
        background: '#fff',
        width: '100%'
      }}
    >
      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={disabled ? 'Select a user above to begin chatting...' : 'Write a message...'}
        disabled={disabled}
        style={{
          flex: 1,
          padding: '12px 16px',
          fontSize: 15,
          borderRadius: 3,
          border: '1px solid #000',
          outline: 'none',
          background: disabled ? '#f5f5f5' : '#fff',
          color: '#000'
        }}
      />
      <button
        type="submit"
        disabled={disabled || !text.trim()}
        style={{
          padding: '12px 28px',
          fontSize: 14,
          fontWeight: 700,
          borderRadius: 3,
          border: '1px solid #000',
          background: disabled || !text.trim() ? '#e0e0e0' : '#000',
          color: disabled || !text.trim() ? '#888' : '#fff',
          cursor: disabled || !text.trim() ? 'not-allowed' : 'pointer'
        }}
      >
        Send
      </button>
    </form>
  );
}
