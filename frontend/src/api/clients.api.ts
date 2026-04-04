import api from './axiosInstance';
import type { Client, CreateClientInput, UpdateClientInput } from '../types/client.types';

export const getClients = (): Promise<Client[]> =>
  api.get('/clients').then((r) => r.data);

export const getClientById = (id: string): Promise<Client> =>
  api.get(`/clients/${id}`).then((r) => r.data);

export const createClient = (data: CreateClientInput): Promise<Client> =>
  api.post('/clients', data).then((r) => r.data);

export const updateClient = (id: string, data: UpdateClientInput): Promise<Client> =>
  api.put(`/clients/${id}`, data).then((r) => r.data);

export const deleteClient = (id: string): Promise<void> =>
  api.delete(`/clients/${id}`).then((r) => r.data);
