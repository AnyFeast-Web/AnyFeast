import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as messagesApi from '../api/messages.api';

export const useMessages = (clientId: string) => {
  return useQuery({
    queryKey: ['messages', clientId],
    queryFn: () => messagesApi.getMessages(clientId),
    enabled: !!clientId,
    refetchInterval: 5000, // Poll every 5 seconds for new messages
  });
};

export const useSendMessage = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ clientId, body }: { clientId: string, body: string }) => 
      messagesApi.sendMessage(clientId, body),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['messages', variables.clientId] });
      queryClient.invalidateQueries({ queryKey: ['message-threads'] });
    },
  });
};

export const useThreads = () => {
  return useQuery({
    queryKey: ['message-threads'],
    queryFn: messagesApi.getThreads,
    refetchInterval: 10000, // Poll every 10 seconds for thread updates
  });
};

export const useMarkRead = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (clientId: string) => messagesApi.markRead(clientId),
    onSuccess: (_, clientId) => {
      queryClient.invalidateQueries({ queryKey: ['message-threads'] });
      queryClient.invalidateQueries({ queryKey: ['messages', clientId] });
    },
  });
};
