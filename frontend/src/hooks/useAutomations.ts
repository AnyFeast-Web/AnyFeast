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
