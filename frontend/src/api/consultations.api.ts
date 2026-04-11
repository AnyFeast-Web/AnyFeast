import api from './axiosInstance';

export const getConsultations = (): Promise<any[]> =>
  api.get('consultations/').then((r) => r.data);

export const getConsultationById = (id: string): Promise<any> =>
  api.get(`consultations/${id}/`).then((r) => r.data);

export const createConsultation = (data: any): Promise<any> =>
  api.post('consultations/', data).then((r) => r.data);

export const updateConsultation = (id: string, data: any): Promise<any> =>
  api.put(`consultations/${id}/`, data).then((r) => r.data);

export const sendConsultationMessage = (id: string, content: string): Promise<any> =>
  api.post(`consultations/${id}/messages`, { content }).then((r) => r.data);

export const deleteConsultation = (id: string): Promise<any> =>
  api.delete(`consultations/${id}/`).then((r) => r.data);
