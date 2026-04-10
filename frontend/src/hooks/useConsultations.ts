import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as consultationsApi from '../api/consultations.api';

export const useConsultations = () =>
  useQuery({ queryKey: ['consultations'], queryFn: consultationsApi.getConsultations });

export const useConsultation = (id: string) =>
  useQuery({
    queryKey: ['consultations', id],
    queryFn: () => consultationsApi.getConsultationById(id),
    enabled: !!id,
  });

export const useCreateConsultation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: consultationsApi.createConsultation,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['consultations'] }),
  });
};

export const useUpdateConsultation = (id: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => consultationsApi.updateConsultation(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['consultations'] });
      qc.invalidateQueries({ queryKey: ['consultations', id] });
    },
  });
};

export const useSendMessage = (id: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (content: string) => consultationsApi.sendConsultationMessage(id, content),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['consultations', id] });
    },
  });
};
