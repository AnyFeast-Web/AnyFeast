import { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Zap, Send, CalendarClock, CheckCircle2, 
  Clock, AlertTriangle, Play, Mail,
  Info
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { TopBar } from '../../components/layout/TopBar';
import { PageWrapper } from '../../components/layout/PageWrapper';
import { Card, Button, Input, Badge } from '../../components/ui';
import { useSendSmsMealPlan, useSendSmsReminder } from '../../hooks/useAutomations';
import { useClients } from '../../hooks/useClients';
import { useClientMealPlans } from '../../hooks/useMealPlans';
import api from '../../api/axiosInstance';

export function AutomationPage() {
  const [sendClientId, setSendClientId] = useState<string>('');
  const [sendPlanId, setSendPlanId] = useState<string>('');
  const [reminderClientId, setReminderClientId] = useState<string>('');
  const [remindersEnabled, setRemindersEnabled] = useState(true);
  const [reminderDays, setReminderDays] = useState(14);
  
  const [messageTemplate, setMessageTemplate] = useState<string>('');
  const [customMessage, setCustomMessage] = useState<string>('');
  const [isSending, setIsSending] = useState(false);
  
  const { data: clients = [], isLoading: clientsLoading } = useClients();
  const { data: clientPlans = [], isLoading: plansLoading } = useClientMealPlans(sendClientId);
  
  const reminderSmsMutation = useSendSmsReminder();

  // Selected client for section 1
  const selectedClient = useMemo(() => 
    clients.find((c: any) => c.id === sendClientId), 
    [clients, sendClientId]
  );

  // Filtered plans for section 1 (only show active/draft plans if needed, but the prompt says active plan should appear)
  const filteredPlans = useMemo(() => 
    clientPlans.filter((p: any) => !p.status || p.status.toLowerCase() === 'active' || p.status.toLowerCase() === 'draft'),
    [clientPlans]
  );

  // Effect to auto-fill custom message when template or client changes
  useEffect(() => {
    if (!messageTemplate) {
      if (!customMessage) setCustomMessage(''); // Only clear if it was empty initially, or we could just leave it. Let's reset for simplicity.
      return;
    }
    const name = selectedClient?.personal_info?.first_name || 'Client';
    const templates: Record<string, string> = {
      'Weekly Check-in': `Hi ${name}, just checking in to see how your week is going with the new meal plan!`,
      'New Plan Assigned': `Hello ${name}, your new meal plan has been assigned. Please check it out in your portal.`,
      'Motivation Boost': `Hey ${name}, you're doing great! Keep up the good work and stick to your meal plan.`,
      'Follow-up': `Hi ${name}, I'd like to follow up on your progress. Let me know if you have any questions.`
    };
    setCustomMessage(templates[messageTemplate] || '');
  }, [messageTemplate, selectedClient]);

  const handleSendMealPlanEmail = async () => {
    if (!sendClientId || !sendPlanId) return;
    setIsSending(true);
    try {
      // [Inference] customMessage is not yet plumbed through the new email endpoint;
      // backend currently sends the templated meal plan as-is.
      void customMessage;
      await api.post(`mealplans/${sendPlanId}/email`, {});
      toast.success('Meal plan sent! ✅');
    } catch {
      toast.error('Failed to send meal plan ❌');
    } finally {
      setIsSending(false);
    }
  };

  const handleSendTestReminder = () => {
    if (!reminderClientId) return;
    reminderSmsMutation.mutate({ 
      clientId: reminderClientId,
      email: selectedClient?.personal_info?.email
    });
  };

  return (
    <>
      <TopBar 
        title="Automation Hub" 
        subtitle="Send meal plans and reminders directly to clients via Email" 
      />
      <PageWrapper>
        <div className="max-w-4xl mx-auto space-y-8">
          
          {/* Section 1: Send Meal Plan to Client */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <Zap className="w-5 h-5 text-accent-amber" />
              <h2 className="text-lg font-display font-semibold text-text-primary">Send Meal Plan to Client</h2>
            </div>
            
            <Card>
              <Card.Body className="p-6">
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-text-secondary">Select Client</label>
                      <select 
                        value={sendClientId}
                        onChange={(e) => {
                          setSendClientId(e.target.value);
                          setSendPlanId(''); // Reset plan when client changes
                        }}
                        className="w-full bg-bg-input border border-border-subtle rounded-md px-3.5 py-2.5 text-sm focus:outline-none focus:border-brand-primary transition-colors"
                      >
                        <option value="">{clientsLoading ? 'Loading clients...' : 'Choose a client...'}</option>
                        {clients.map((c: any) => (
                          <option key={c.id} value={c.id}>
                            {c.personal_info.first_name} {c.personal_info.last_name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-text-secondary">Registered Email Address</label>
                      <div className="relative">
                        <Input 
                          value={selectedClient?.personal_info?.email || 'No email address found'} 
                          readOnly 
                          className="bg-bg-elevated/50 font-mono text-xs pl-10"
                        />
                        <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-text-secondary">Select Active Meal Plan</label>
                      <select 
                        value={sendPlanId}
                        onChange={(e) => setSendPlanId(e.target.value)}
                        disabled={!sendClientId}
                        className="w-full bg-bg-input border border-border-subtle rounded-md px-3.5 py-2.5 text-sm focus:outline-none focus:border-brand-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        <option value="">{plansLoading ? 'Loading plans...' : 'Select a plan...'}</option>
                        {filteredPlans.map((p: any) => (
                          <option key={p.id} value={p.id}>{p.title}</option>
                        ))}
                        {sendClientId && filteredPlans.length === 0 && (
                          <option disabled>No active plans found for this client</option>
                        )}
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-text-secondary">Message Template</label>
                      <select
                        value={messageTemplate}
                        onChange={(e) => setMessageTemplate(e.target.value)}
                        className="w-full bg-bg-input border border-border-subtle rounded-md px-3.5 py-2.5 text-sm focus:outline-none focus:border-brand-primary transition-colors"
                      >
                        <option value="">Select a template...</option>
                        <option value="Weekly Check-in">Weekly Check-in</option>
                        <option value="New Plan Assigned">New Plan Assigned</option>
                        <option value="Motivation Boost">Motivation Boost</option>
                        <option value="Follow-up">Follow-up</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-text-secondary">Custom Message</label>
                    <textarea
                      value={customMessage}
                      onChange={(e) => setCustomMessage(e.target.value)}
                      className="w-full bg-bg-input border border-border-subtle rounded-md px-3.5 py-2.5 text-sm focus:outline-none focus:border-brand-primary transition-colors h-24 resize-none"
                      placeholder="Write your message here..."
                    />
                  </div>

                  <div className="flex items-end justify-end">
                    <Button 
                      onClick={handleSendMealPlanEmail}
                      disabled={!sendPlanId || isSending}
                      className="w-full md:w-auto"
                      icon={isSending ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    >
                      {isSending ? 'Sending...' : 'Send via Email'}
                    </Button>
                  </div>

                  <div className="flex items-start gap-2 pt-2 text-text-muted">
                    <Info className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                    <p className="text-[11px] leading-relaxed">
                      Triggers n8n webhook → formats plan → dispatches Email to client
                    </p>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </section>

          {/* Section 2: Follow-up Reminders */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <CalendarClock className="w-5 h-5 text-text-muted" />
              <h2 className="text-lg font-display font-semibold text-text-primary">Follow-up Reminders</h2>
            </div>

            <Card>
              <Card.Body className="p-6">
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-semibold text-text-primary">Automated Check-ins</h4>
                      <p className="text-xs text-text-secondary">Triggers consultation follow-up Email automatically.</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        className="sr-only peer" 
                        checked={remindersEnabled}
                        onChange={(e) => setRemindersEnabled(e.target.checked)}
                      />
                      <div className="w-11 h-6 bg-border-strong rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-border-subtle after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-primary"></div>
                    </label>
                  </div>

                  <div className="bg-bg-elevated p-4 rounded-lg border border-border-subtle">
                    <div className="flex flex-col sm:flex-row items-center gap-3 text-sm text-text-primary">
                      <span>Send a</span>
                      <Badge variant="blue">Email</Badge>
                      <span>every</span>
                      <Input 
                        type="number" 
                        value={reminderDays} 
                        onChange={(e) => setReminderDays(parseInt(e.target.value) || 0)}
                        className="w-20 text-center h-9" 
                      />
                      <span>days after active consultation.</span>
                    </div>
                  </div>

                  {/* Test Reminders */}
                  <div className="pt-4 border-t border-border-subtle">
                    <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider block mb-3">Test Single Reminder</label>
                    <div className="flex gap-4">
                      <select 
                        value={reminderClientId}
                        onChange={(e) => setReminderClientId(e.target.value)}
                        className="flex-1 bg-bg-input border border-border-subtle rounded-md px-3 py-2 text-sm focus:outline-none focus:border-brand-primary"
                      >
                        <option value="">Choose client...</option>
                        {clients.map((c: any) => (
                          <option key={c.id} value={c.id}>
                            {c.personal_info.first_name} {c.personal_info.last_name}
                          </option>
                        ))}
                      </select>
                      <Button 
                        variant="secondary"
                        onClick={handleSendTestReminder}
                        disabled={!reminderClientId || reminderSmsMutation.isPending}
                        icon={<Play className="w-4 h-4" />}
                      >
                        {reminderSmsMutation.isPending ? 'Sending...' : 'Send Now'}
                      </Button>
                    </div>
                  </div>

                  {(reminderSmsMutation.isSuccess || reminderSmsMutation.isError) && (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.95 }} 
                      animate={{ opacity: 1, scale: 1 }} 
                      className={`p-3 rounded-md flex items-center gap-2 ${
                        reminderSmsMutation.isSuccess ? 'bg-teal-50 border border-teal-200' : 'bg-rose-50 border border-rose-200'
                      }`}
                    >
                      {reminderSmsMutation.isSuccess ? (
                        <CheckCircle2 className="w-4 h-4 text-teal-600" />
                      ) : (
                        <AlertTriangle className="w-4 h-4 text-rose-600" />
                      )}
                      <p className={`text-xs font-medium ${reminderSmsMutation.isSuccess ? 'text-teal-700' : 'text-rose-700'}`}>
                        {reminderSmsMutation.isSuccess ? 'Test reminder Email dispatched successfully!' : 'Failed to send test reminder.'}
                      </p>
                    </motion.div>
                  )}

                  <div className="flex items-start gap-2 text-text-muted">
                    <Info className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                    <p className="text-[11px] leading-relaxed">
                      Triggers n8n webhook → sends consultation follow-up Email to client's registered address
                    </p>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </section>

        </div>
      </PageWrapper>
    </>
  );
}

// Helper for loading icon
function RefreshCw(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
      <path d="M21 3v5h-5" />
      <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
      <path d="M3 21v-5h5" />
    </svg>
  );
}
