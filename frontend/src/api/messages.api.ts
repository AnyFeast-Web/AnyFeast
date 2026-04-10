import api from './axiosInstance';

export const getMessages = (clientId: string) => 
  api.get(`/messages/clients/${clientId}`).then(r => r.data);

export const sendMessage = (clientId: string, body: string) =>
  api.post('/messages/send', { client_id: clientId, body }).then(r => r.data);

export const markRead = (clientId: string) =>
  api.patch(`/messages/clients/${clientId}/read`).then(r => r.data);

export const getThreads = () =>
  api.get('/messages/threads').then(r => r.data);
