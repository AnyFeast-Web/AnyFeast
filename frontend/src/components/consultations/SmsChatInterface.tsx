import { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, Send, Smartphone, Clock, 
  User, CheckCheck, Check, MoreVertical,
  MessageSquare
} from 'lucide-react';
import { Avatar, Input, Button, Badge, Card } from '../ui';
import { useMessages, useSendMessage, useThreads, useMarkRead } from '../../hooks/useMessages';
import { useClients } from '../../hooks/useClients';
import { useConsultations } from '../../hooks/useConsultations';
import { formatTimeAgo, formatDate } from '../../utils/formatters';

interface ThreadInfo {
  id: string;
  name: string;
  phone: string;
  lastMessage: any;
  unreadCount: number;
  timestamp: string;
}

export function SmsChatInterface() {
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [messageBody, setMessageBody] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: threads = [], isLoading: threadsLoading } = useThreads();
  const { data: clients = [] } = useClients();
  const { data: consultations = [] } = useConsultations();
  
  const { data: activeMessages = [], isLoading: messagesLoading } = useMessages(selectedClientId || '');
  const sendMessageMutation = useSendMessage();
  const markReadMutation = useMarkRead();

  // Mark as read when thread is opened
  useEffect(() => {
    if (selectedClientId) {
      markReadMutation.mutate(selectedClientId);
    }
  }, [selectedClientId]);

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeMessages]);

  const clientsWithConsultations = useMemo(() => {
    const consultationClientIds = new Set(consultations.map((c: any) => c.client_id));
    return clients.filter((c: any) => consultationClientIds.has(c.id));
  }, [clients, consultations]);

  const filteredThreads = useMemo(() => {
    const query = searchTerm.toLowerCase();
    
    // Map existing threads to client info
    const threadMap = new Map(threads.map((t: any) => [t.client_id, t]));
    
    return clientsWithConsultations
      .map(client => {
        const thread = threadMap.get(client.id) as any;
        return {
          id: client.id,
          name: `${client.personal_info.first_name} ${client.personal_info.last_name}`,
          phone: client.personal_info.phone,
          lastMessage: thread?.last_message || null,
          unreadCount: thread?.unread_count || 0,
          timestamp: thread?.last_message?.timestamp || client.created_at
        } as ThreadInfo;
      })
      .filter(t => t.name.toLowerCase().includes(query))
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [threads, clientsWithConsultations, searchTerm]);

  const selectedClient = useMemo(() => 
    filteredThreads.find(t => t.id === selectedClientId),
    [filteredThreads, selectedClientId]
  );

  const handleSend = () => {
    if (!selectedClientId || !messageBody.trim() || sendMessageMutation.isPending) return;
    
    sendMessageMutation.mutate(
      { clientId: selectedClientId, body: messageBody },
      { onSuccess: () => setMessageBody('') }
    );
  };

  return (
    <div className="flex h-[600px] bg-bg-base border border-border-subtle rounded-xl overflow-hidden shadow-sm">
      
      {/* LEFT PANEL: THREAD LIST */}
      <div className="w-80 border-r border-border-subtle flex flex-col bg-bg-surface">
        <div className="p-4 border-b border-border-subtle bg-bg-elevated/30">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <Input
              placeholder="Search chats..."
              className="pl-9 h-9 text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-border-subtle/50">
          {filteredThreads.map((thread) => (
            <button
              key={thread.id}
              onClick={() => setSelectedClientId(thread.id)}
              className={`w-full text-left p-4 flex gap-3 transition-colors hover:bg-bg-elevated/50 ${
                selectedClientId === thread.id ? 'bg-brand-primary/5 border-l-4 border-brand-primary' : 'border-l-4 border-transparent'
              }`}
            >
              <Avatar name={thread.name} size="md" />
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start mb-0.5">
                  <span className="text-sm font-semibold text-text-primary truncate">{thread.name}</span>
                  <span className="text-[10px] text-text-muted whitespace-nowrap ml-2">
                    {thread.lastMessage ? formatTimeAgo(thread.lastMessage.timestamp) : ''}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <p className="text-xs text-text-secondary truncate pr-4">
                    {thread.lastMessage ? thread.lastMessage.body : 'No messages yet'}
                  </p>
                  {thread.unreadCount > 0 && (
                    <span className="w-2 h-2 rounded-full bg-brand-primary flex-shrink-0 animate-pulse" />
                  )}
                </div>
              </div>
            </button>
          ))}
          {filteredThreads.length === 0 && (
            <div className="p-8 text-center text-text-muted italic text-sm">
              No active chat threads found.
            </div>
          )}
        </div>
      </div>

      {/* RIGHT PANEL: CHREAD VIEW */}
      <div className="flex-1 flex flex-col bg-bg-base relative">
        {selectedClient ? (
          <>
            {/* Header */}
            <div className="p-4 border-b border-border-subtle bg-bg-surface flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar name={selectedClient.name} size="sm" />
                <div>
                  <h3 className="text-sm font-bold text-text-primary">{selectedClient.name}</h3>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono text-text-secondary">{selectedClient.phone}</span>
                    <Badge variant="blue" size="sm" className="h-4 scale-75 origin-left">SMS via n8n</Badge>
                  </div>
                </div>
              </div>
              <Button variant="ghost" size="sm" icon={<MoreVertical className="w-4 h-4" />} />
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[url('/chat-bg-pattern.png')] bg-repeat">
              {activeMessages.length === 0 && !messagesLoading && (
                <div className="flex flex-col items-center justify-center h-full text-center opacity-50">
                  <div className="w-12 h-12 rounded-full bg-bg-elevated flex items-center justify-center mb-2">
                    <Smartphone className="w-6 h-6 text-text-muted" />
                  </div>
                  <p className="text-sm font-medium text-text-secondary">Send a message to start the conversation</p>
                  <p className="text-[10px] text-text-muted mt-1">Updates sent to {selectedClient.phone}</p>
                </div>
              )}
              
              <AnimatePresence initial={false}>
                {activeMessages.map((msg: any) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    className={`flex ${msg.direction === 'out' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[75%] rounded-2xl px-4 py-2.5 shadow-sm ${
                        msg.direction === 'out'
                          ? 'bg-brand-primary text-white rounded-tr-none'
                          : 'bg-bg-surface border border-border-subtle text-text-primary rounded-tl-none'
                      }`}
                    >
                      <p className="text-sm leading-relaxed">{msg.body}</p>
                      <div className={`flex items-center justify-end gap-1 mt-1 ${msg.direction === 'out' ? 'text-white/60' : 'text-text-muted'}`}>
                        <span className="text-[9px] font-medium">
                          {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        {msg.direction === 'out' && (
                          msg.read ? <CheckCheck className="w-3 h-3" /> : <Check className="w-3 h-3" />
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              <div ref={messagesEndRef} />
            </div>

            {/* Input Bar */}
            <div className="p-4 bg-bg-surface border-t border-border-subtle">
              <div className="flex items-end gap-3 max-w-3xl mx-auto">
                <div className="flex-1 bg-bg-input rounded-2xl border border-border-subtle focus-within:border-brand-primary transition-colors pr-2 flex items-end">
                  <textarea
                    rows={1}
                    placeholder="Type a message..."
                    className="w-full bg-transparent border-none text-sm p-3 focus:ring-0 resize-none max-h-32"
                    value={messageBody}
                    onChange={(e) => setMessageBody(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSend();
                      }
                    }}
                  />
                  <div className="pb-2">
                    <Button
                      size="sm"
                      className="rounded-xl h-9 w-9 p-0 bg-brand-primary hover:bg-brand-primary/90 text-white"
                      disabled={!messageBody.trim() || sendMessageMutation.isPending}
                      onClick={handleSend}
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
              <p className="text-[10px] text-center text-text-muted mt-2">
                Triggers n8n webhook → Twilio SMS
              </p>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-text-muted">
            <div className="w-20 h-20 rounded-full bg-bg-elevated flex items-center justify-center mb-4">
              <MessageSquare className="w-10 h-10 opacity-20" />
            </div>
            <h3 className="text-lg font-display font-semibold text-text-primary">SMS Chat Dashboard</h3>
            <p className="text-sm max-w-xs mt-2">
              Select a client from the left to view their SMS history and send new messages via n8n & Twilio.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
