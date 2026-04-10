import { useMutation } from '@tanstack/react-query';
import * as automationsApi from '../api/automations.api';

export const useTriggerOrder = () => {
  return useMutation({
    mutationFn: automationsApi.triggerOrder,
  });
};

export const useDispatchEmail = () => {
  return useMutation({
    mutationFn: automationsApi.dispatchEmail,
  });
};

export const useSendSmsMealPlan = () => {
  return useMutation({
    mutationFn: automationsApi.sendSmsMealPlan,
  });
};

export const useSendSmsReminder = () => {
  return useMutation({
    mutationFn: automationsApi.sendSmsReminder,
  });
};
