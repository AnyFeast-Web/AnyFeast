import api from './axiosInstance';

export const triggerOrder = (): Promise<{status: string, message: string}> =>
  api.post('webhooks/trigger-order/').then((r) => r.data);

export const dispatchEmail = (data: any): Promise<{status: string, message: string}> =>
  api.post('webhooks/dispatch-email/', data).then((r) => r.data);

export const sendSmsMealPlan = (data: any): Promise<any> =>
  api.post('webhooks/sms-meal-plan/', data).then((r) => r.data);

export const sendSmsReminder = (data: any): Promise<any> =>
  api.post('webhooks/sms-reminder/', data).then((r) => r.data);
