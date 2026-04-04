import api from './axiosInstance';

export const triggerOrder = (): Promise<{status: string, message: string}> =>
  api.post('/webhooks/trigger-order').then((r) => r.data);

export const dispatchEmail = (data: any): Promise<{status: string, message: string}> =>
  api.post('/webhooks/dispatch-email', data).then((r) => r.data);
