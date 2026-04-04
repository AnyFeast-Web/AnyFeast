import { useState } from 'react';
import { motion } from 'framer-motion';
import { Send, Paperclip } from 'lucide-react';
import { TopBar } from '../../components/layout/TopBar';
import { PageWrapper } from '../../components/layout/PageWrapper';
import { Card, Avatar, Badge, Button, Input } from '../../components/ui';
import { useConsultations } from '../../hooks/useConsultations';
import { formatDate, formatTimeAgo } from '../../utils/formatters';

export function ConsultationPage() {
  const { data: consultations = [], isLoading, error } = useConsultations();
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [message, setMessage] = useState('');

  const selectedSession = consultations.find((c: any) => c.id === selectedSessionId) || consultations[0];

  if (isLoading) {
    return (
      <>
        <TopBar title="Consultations" subtitle="Client communication hub" />
        <PageWrapper>
          <div className="flex items-center justify-center h-[60vh]">
            <div className="w-8 h-8 border-4 border-brand-primary border-t-transparent rounded-full animate-spin" />
          </div>
        </PageWrapper>
      </>
    );
  }

  if (error) {
    return (
      <>
        <TopBar title="Consultations" subtitle="Client communication hub" />
        <PageWrapper>
          <div className="p-4 bg-accent-rose/10 text-accent-rose rounded-lg mt-6">
            Failed to load consultations. Please check your connection.
          </div>
        </PageWrapper>
      </>
    );
  }

  if (consultations.length === 0) {
    return (
      <>
        <TopBar title="Consultations" subtitle="Client communication hub" />
        <PageWrapper>
          <div className="flex flex-col items-center justify-center h-[60vh] text-text-muted">
            <p className="text-lg font-display font-medium">No consultations yet</p>
            <p className="text-sm mt-1">Consultations will appear here once created.</p>
          </div>
        </PageWrapper>
      </>
    );
  }

  return (
    <>
      <TopBar title="Consultations" subtitle="Client communication hub" />
      <PageWrapper className="!max-w-none">
        <div className="flex gap-6 h-[calc(100vh-140px)]">
          {/* Session List */}
          <div className="w-80 flex-shrink-0 space-y-2 overflow-y-auto">
            {consultations.map((session: any) => (
              <button key={session.id} onClick={() => setSelectedSessionId(session.id)}
                className={`w-full text-left p-4 rounded-lg transition-all ${
                  selectedSession?.id === session.id ? 'bg-brand-primary/10 border border-brand-primary/30' : 'bg-bg-surface border border-border-subtle hover:border-border-strong'
                }`}>
                <div className="flex items-center gap-3 mb-2">
                  <Avatar name={session.client_name || 'Unknown'} size="sm" active />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-display font-medium text-text-primary truncate">{session.client_name || 'Unknown Client'}</p>
                    <p className="text-xs text-text-secondary">{session.date ? formatDate(session.date) : 'No date'}</p>
                  </div>
                  <Badge variant="blue" size="sm">{session.duration_min || 0}m</Badge>
                </div>
                <p className="text-xs text-text-muted truncate">
                  {session.messages?.length > 0
                    ? session.messages[session.messages.length - 1]?.content
                    : session.notes?.goals || 'No messages yet'}
                </p>
              </button>
            ))}
          </div>

          {/* Chat Area */}
          {selectedSession && (
            <div className="flex-1 flex flex-col bg-bg-surface border border-border-subtle rounded-lg overflow-hidden">
              {/* Chat Header */}
              <div className="px-5 py-4 border-b border-border-subtle flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar name={selectedSession.client_name || 'Unknown'} size="md" active />
                  <div>
                    <p className="text-sm font-display font-semibold text-text-primary">{selectedSession.client_name || 'Unknown Client'}</p>
                    <p className="text-xs text-text-secondary">{selectedSession.date ? formatDate(selectedSession.date) : ''} · {selectedSession.duration_min || 0} min</p>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
                {(selectedSession.messages || []).map((msg: any, i: number) => (
                  <motion.div key={msg.id || i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05, duration: 0.2 }}
                    className={`flex ${msg.sender === 'nutritionist' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[70%] px-4 py-2.5 rounded-xl ${
                      msg.sender === 'nutritionist'
                        ? 'bg-brand-primary/15 text-text-primary rounded-br-sm'
                        : 'bg-bg-elevated text-text-primary rounded-bl-sm'
                    }`}>
                      <p className="text-sm">{msg.content}</p>
                      <p className="text-xs text-text-muted mt-1">{msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}</p>
                    </div>
                  </motion.div>
                ))}
                {(!selectedSession.messages || selectedSession.messages.length === 0) && (
                  <div className="flex items-center justify-center h-full text-text-muted text-sm">
                    No messages in this consultation yet.
                  </div>
                )}
              </div>

              {/* Input */}
              <div className="px-5 py-4 border-t border-border-subtle">
                <div className="flex items-center gap-3">
                  <button className="p-2 rounded-md text-text-secondary hover:text-text-primary hover:bg-bg-elevated transition-colors">
                    <Paperclip className="w-5 h-5" />
                  </button>
                  <input value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Type a message..."
                    className="flex-1 bg-bg-input border border-border-subtle rounded-md px-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:border-brand-primary focus:outline-none transition-colors" />
                  <Button size="sm" icon={<Send className="w-4 h-4" />} disabled={!message.trim()}>Send</Button>
                </div>
              </div>
            </div>
          )}

          {/* Notes Panel */}
          {selectedSession && (
            <div className="w-80 flex-shrink-0 hidden xl:block space-y-4 overflow-y-auto">
              <Card>
                <Card.Header><Card.Title>Session Notes</Card.Title></Card.Header>
                <Card.Body>
                  {selectedSession.notes && typeof selectedSession.notes === 'object' ? (
                    Object.entries(selectedSession.notes).map(([key, value]) => (
                      <div key={key} className="mb-4 last:mb-0">
                        <p className="text-xs font-display font-semibold text-text-secondary uppercase mb-1">{key.replace('_', ' ')}</p>
                        <p className="text-sm text-text-primary">{(value as string) || 'Not recorded'}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-text-muted">No notes recorded.</p>
                  )}
                </Card.Body>
              </Card>
            </div>
          )}
        </div>
      </PageWrapper>
    </>
  );
}
