import axios from 'axios';

// Centralized API Base URL configuration:
// Supports VITE_API_URL environment variable for production (e.g. Render backend)
// Falls back to http://localhost:8080 during local development.
// Normalizes trailing slashes and ensures /api path is correctly appended.
const rawApiUrl = (import.meta.env.VITE_API_URL || 'http://localhost:8080').trim();
const cleanBaseUrl = rawApiUrl.replace(/\/+$/, '');
export const API_BASE = cleanBaseUrl.endsWith('/api') ? cleanBaseUrl : `${cleanBaseUrl}/api`;

const client = axios.create({
  baseURL: API_BASE,
});

// Attach bearer token to outgoing requests if available
client.interceptors.request.use((config) => {
  const token = localStorage.getItem('chatflow_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const setAuthToken = (token) => {
  if (token) {
    localStorage.setItem('chatflow_token', token);
  } else {
    localStorage.removeItem('chatflow_token');
  }
};

export const getAuthToken = () => localStorage.getItem('chatflow_token');

// Auth endpoints
export const login = (identifier, password) =>
  client.post('/auth/login', { username: identifier, email: identifier, password });

export const register = (email, username, password) =>
  client.post('/auth/register', { email, username, password });

export const getRandomUsername = () => client.get('/auth/random-username');

export const getMe = () => client.get('/auth/me');

export const logoutApi = () => client.post('/auth/logout');

export const forgotPassword = (email) => client.post('/auth/forgot-password', { email });

export const resetPassword = (email, otp, newPassword) =>
  client.post('/auth/reset-password', { email, otp, newPassword });

// User & Profile endpoints
export const searchUsers = (q) => client.get('/users/search', { params: { q } });

export const getUserProfile = (username) => client.get(`/users/${username}`);

export const getMyProfile = () => client.get('/profile');

export const updateProfile = (bio) => client.put('/profile', { bio });

// Posts endpoints
export const getPosts = () => client.get('/posts');

export const getUserPosts = (username) => client.get(`/posts/user/${username}`);

export const createPost = (content) => client.post('/posts', { content });

export const toggleLikePost = (postId) => client.post(`/posts/${postId}/like`);

export const deletePost = (postId) => client.delete(`/posts/${postId}`);

// Session-based message endpoints
export const getMySessions = () => client.get('/sessions');

export const createOrGetSession = (otherUser) =>
  client.post('/sessions', { otherUser });

export const getSessionMessages = (sessionId) =>
  client.get(`/sessions/${sessionId}/messages`);

export const sendMessageToSession = (sessionId, content) =>
  client.post(`/sessions/${sessionId}/messages`, { content });

export const deleteSession = (sessionId) =>
  client.delete(`/sessions/${sessionId}`);

// Legacy aliases
export const getConversation = (userA, userB) =>
  client.get('/messages', { params: { userA, userB } });

export const sendMessage = (data) => client.post('/messages', data);

export const deleteConversation = (userA, userB) =>
  client.delete('/messages', { params: { userA, userB } });

export default client;
