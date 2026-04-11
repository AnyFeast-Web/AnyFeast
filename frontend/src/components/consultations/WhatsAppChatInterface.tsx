import { useState, useMemo, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, Send, Smartphone, MoreVertical,
  CheckCheck, Check, MessageCircle
} from 'lucide-react';
import { Avatar, Input, Button, Badge, Card } from '../ui';
import { useClients } from '../../hooks/useClients';
import { useConsultations } from '../../hooks/useConsultations';
import { formatTimeAgo, formatDate } from '../../utils/formatters';

interface Message {
  id: string;
  direction: 'in' | 'out';
  body: string;
  timestamp: string;
  read: boolean;
}

export function WhatsAppChatInterface() {
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [messageBody, setMessageBody] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: clients = [] } = useClients();
  const { data: consultations = [] } = useConsultations();

  const clientsWithConsultations = useMemo(() => {
    const consultationClientIds = new Set(consultations.map((c: any) => c.client_id));
    return clients.filter((c: any) => consultationClientIds.has(c.id));
  }, [clients, consultations]);

  const [mockMessages, setMockMessages] = useState<Record<string, Message[]>>({});

  useEffect(() => {
    if (clientsWithConsultations.length > 0 && Object.keys(mockMessages).length === 0) {
      const initialMockState: Record<string, Message[]> = {};
      clientsWithConsultations.forEach((c: any) => {
        initialMockState[c.id] = [
          {
            id: `1_${c.id}`,
            direction: 'out',
            body: 'Hello! Please find your updated meal plan attached. How has your protocol been going this week?',
            timestamp: new Date(Date.now() - 86400000).toISOString(),
            read: true
          },
          {
            id: `2_${c.id}`,
            direction: 'in',
            body: 'Hi! Doing great. Is it possible to swap out the chicken for tofu for the lunches?',
            timestamp: new Date(Date.now() - 3600000).toISOString(),
            read: false
          }
        ];
      });
      setMockMessages(initialMockState);
    }
  }, [clientsWithConsultations]);

  // Mark all as read for selected client
  useEffect(() => {
    if (selectedClientId && mockMessages[selectedClientId]) {
      setMockMessages(prev => {
        const msgs = prev[selectedClientId].map(m => ({ ...m, read: true }));
        return { ...prev, [selectedClientId]: msgs };
      });
    }
  }, [selectedClientId]);

  // Scroll to bottom
  const activeMessages = selectedClientId ? (mockMessages[selectedClientId] || []) : [];
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeMessages]);

  const filteredThreads = useMemo(() => {
    const query = searchTerm.toLowerCase();
    
    return clientsWithConsultations
      .map(client => {
        const msgs = mockMessages[client.id] || [];
        const lastMessage = msgs[msgs.length - 1] || null;
        const unreadCount = selectedClientId === client.id ? 0 : msgs.filter(m => m.direction === 'in' && !m.read).length;
        
        return {
          id: client.id,
          name: `${client.personal_info.first_name} ${client.personal_info.last_name}`,
          phone: client.personal_info.phone,
          lastMessage,
          unreadCount,
          timestamp: lastMessage?.timestamp || client.created_at
        };
      })
      .filter(t => t.name.toLowerCase().includes(query))
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [clientsWithConsultations, searchTerm, mockMessages, selectedClientId]);

  const selectedClient = useMemo(() => 
    filteredThreads.find(t => t.id === selectedClientId),
    [filteredThreads, selectedClientId]
  );

  const handleSend = () => {
    if (!selectedClientId || !messageBody.trim()) return;
    
    const newMsg: Message = {
      id: Date.now().toString(),
      direction: 'out',
      body: messageBody,
      timestamp: new Date().toISOString(),
      read: true
    };
    
    setMockMessages(prev => ({
      ...prev,
      [selectedClientId]: [...(prev[selectedClientId] || []), newMsg]
    }));
    
    setMessageBody('');
    
    // Simulate auto-reply after 2 seconds
    setTimeout(() => {
      const replyMsg: Message = {
        id: (Date.now() + 1).toString(),
        direction: 'in',
        body: 'Noted! I will make those adjustments.',
        timestamp: new Date().toISOString(),
        read: false
      };
      setMockMessages(current => {
        // Only if it hasn't somehow been deleted
        if (current[selectedClientId]) {
           return {
             ...current,
             [selectedClientId]: [...current[selectedClientId], replyMsg]
           }
        }
        return current;
      });
    }, 2000);
  };

  return (
    <div className="flex h-[600px] bg-bg-base border border-border-subtle rounded-xl overflow-hidden shadow-sm">
      
      {/* LEFT PANEL: THREAD LIST */}
      <div className="w-80 border-r border-border-subtle flex flex-col bg-bg-surface">
        <div className="p-4 border-b border-border-subtle bg-bg-elevated/30">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <Input
              placeholder="Search WhatsApp chats..."
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
                selectedClientId === thread.id ? 'bg-[#25D366]/5 border-l-4 border-[#25D366]' : 'border-l-4 border-transparent'
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
                    <span className="w-4 h-4 rounded-full bg-[#25D366] text-white flex items-center justify-center text-[10px] font-bold">
                      {thread.unreadCount}
                    </span>
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

      {/* RIGHT PANEL: THREAD VIEW */}
      <div className="flex-1 flex flex-col bg-[#efeae2] relative">
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
                    <Badge variant="teal" size="sm" className="h-4 scale-75 origin-left bg-[#25D366] text-white">WhatsApp Integration</Badge>
                  </div>
                </div>
              </div>
              <Button variant="ghost" size="sm" icon={<MoreVertical className="w-4 h-4" />} />
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {activeMessages.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full text-center opacity-50">
                  <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center mb-2 shadow-sm">
                    <MessageCircle className="w-6 h-6 text-[#25D366]" />
                  </div>
                  <p className="text-sm font-medium text-text-secondary">Send a message to start the WhatsApp conversation</p>
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
                      className={`max-w-[75%] rounded-lg px-4 py-2 shadow-sm relative ${
                        msg.direction === 'out'
                          ? 'bg-[#dcf8c6] text-gray-800 rounded-tr-none'
                          : 'bg-white text-gray-800 rounded-tl-none'
                      }`}
                    >
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.body}</p>
                      <div className={`flex items-center justify-end gap-1 mt-1 text-[10px] font-medium text-gray-500`}>
                        <span>{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        {msg.direction === 'out' && (
                          <CheckCheck className={`w-3 h-3 ${msg.read ? 'text-[#34B7F1]' : 'text-gray-400'}`} />
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              <div ref={messagesEndRef} />
            </div>

            {/* Input Bar */}
            <div className="p-4 bg-[#f0f2f5]">
              <div className="flex items-end gap-3 max-w-3xl mx-auto">
                <div className="flex-1 bg-white rounded-2xl border border-transparent focus-within:border-[#25D366] transition-colors pr-2 flex items-end shadow-sm">
                  <textarea
                    rows={1}
                    placeholder="Type a message..."
                    className="w-full bg-transparent border-none text-sm p-3 focus:ring-0 resize-none max-h-32 text-gray-800"
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
                      className="rounded-full h-10 w-10 p-0 bg-[#25D366] hover:bg-[#20bd5a] text-white flex items-center justify-center border-none"
                      disabled={!messageBody.trim()}
                      onClick={handleSend}
                    >
                      <Send className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-text-muted">
            <div className="w-20 h-20 rounded-full bg-[#dcf8c6] flex items-center justify-center mb-4">
              <MessageCircle className="w-10 h-10 text-[#25D366]" />
            </div>
            <h3 className="text-lg font-display font-semibold text-text-primary">WhatsApp Dashboard</h3>
            <p className="text-sm max-w-xs mt-2">
              Select a client from the left to view their WhatsApp history and send new messages using mock data.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
