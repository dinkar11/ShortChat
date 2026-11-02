import { useEffect, useRef } from 'react';

export default function MessageList({ messages, myId }) {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (messages.length === 0) {
    return (
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#666',
        fontSize: 15,
        gap: 8,
        width: '100%',
        height: '100%'
      }}>
        <div style={{ fontWeight: 700, color: '#000', fontSize: 16 }}>No messages yet</div>
        <div style={{ fontSize: 13 }}>Send a message below to start chatting in this session</div>
      </div>
    );
  }

  return (
    <div style={{
      flex: 1,
      overflowY: 'auto',
      padding: '24px 32px',
      display: 'flex',
      flexDirection: 'column',
      gap: 12,
      background: '#fafafa',
      width: '100%'
    }}>
      {messages.map((message) => {
        const mine = message.senderId === myId;
        const time = new Date(message.sentAt).toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit'
        });

        return (
          <div
            key={message.id}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: mine ? 'flex-end' : 'flex-start',
              width: '100%'
            }}
          >
            <div style={{
              fontSize: 11,
              fontWeight: 700,
              color: '#666',
              marginBottom: 4,
              textTransform: 'uppercase'
            }}>
              {message.senderId}
            </div>

            <div style={{
              background: mine ? '#000000' : '#ffffff',
              color: mine ? '#ffffff' : '#000000',
              border: '1px solid #000000',
              borderRadius: mine ? '12px 12px 2px 12px' : '12px 12px 12px 2px',
              padding: '10px 16px',
              maxWidth: '60%',
              minWidth: 120,
              wordBreak: 'break-word',
              fontSize: 15,
              lineHeight: '1.5'
            }}>
              <div>{message.content}</div>
              <div style={{
                fontSize: 10,
                opacity: mine ? 0.7 : 0.5,
                marginTop: 4,
                textAlign: 'right'
              }}>
                {time}
              </div>
            </div>
          </div>
        );
      })}
      <div ref={bottomRef} />
    </div>
  );
}
