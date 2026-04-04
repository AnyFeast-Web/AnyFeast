import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as clientsApi from '../api/clients.api';

export const useClients = () =>
  useQuery({ queryKey: ['clients'], queryFn: clientsApi.getClients });

export const useClient = (id: string) =>
  useQuery({
    queryKey: ['clients', id],
    queryFn: () => clientsApi.getClientById(id),
    enabled: !!id,
  });

export const useCreateClient = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: clientsApi.createClient,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['clients'] }),
  });
};

export const useUpdateClient = (id: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => clientsApi.updateClient(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['clients'] });
      qc.invalidateQueries({ queryKey: ['clients', id] });
    },
  });
};

export const useDeleteClient = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: clientsApi.deleteClient,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['clients'] }),
  });
};
