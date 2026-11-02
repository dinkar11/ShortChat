import { useState, useEffect, useCallback, useRef } from 'react';
import { getSessionMessages, sendMessageToSession, deleteSession, getConversation, sendMessage, deleteConversation } from '../api';

/**
 * Custom hook that manages session-based 1-to-1 conversation via polling.
 *
 * lastCountRef optimization: We track the message count between polls.
 * If the count hasn't changed, we skip calling setMessages to avoid
 * unnecessary re-renders and scroll-jump flicker.
 *
 * Messages are fetched and stored strictly per session.
 */
export default function useConversation(myId, otherId, sessionId) {
  const [messages, setMessages] = useState([]);
  const lastCountRef = useRef(0);

  const load = useCallback(async () => {
    if (!sessionId && (!myId || !otherId || myId === otherId)) return;
    try {
      let response;
      if (sessionId) {
        response = await getSessionMessages(sessionId);
      } else {
        response = await getConversation(myId, otherId);
      }
      const fetched = response.data;
      if (fetched.length !== lastCountRef.current) {
        lastCountRef.current = fetched.length;
        setMessages(fetched);
      }
    } catch (error) {
      if (error.response?.status === 403) {
        console.warn('Authorization: You do not have access to this session');
      } else {
        console.error('Failed to load messages:', error);
      }
    }
  }, [sessionId, myId, otherId]);

  useEffect(() => {
    setMessages([]);
    lastCountRef.current = 0;

    if (!sessionId && (!myId || !otherId || myId === otherId)) return;

    load();
    const interval = setInterval(load, 2000);
    return () => clearInterval(interval);
  }, [sessionId, myId, otherId, load]);

  const send = useCallback(async (content) => {
    if (sessionId) {
      await sendMessageToSession(sessionId, content);
    } else if (myId && otherId) {
      await sendMessage({ senderId: myId, receiverId: otherId, content });
    }
    await load();
  }, [sessionId, myId, otherId, load]);

  const clear = useCallback(async () => {
    if (sessionId) {
      await deleteSession(sessionId);
    } else if (myId && otherId) {
      await deleteConversation(myId, otherId);
    }
    lastCountRef.current = 0;
    setMessages([]);
  }, [sessionId, myId, otherId]);

  return { messages, send, clear };
}
