import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Zap, Send, CalendarClock, ShoppingCart, 
  CheckCircle2, Clock, AlertTriangle, Play, Settings2,
  RefreshCw, FileText
} from 'lucide-react';
import { TopBar } from '../../components/layout/TopBar';
import { PageWrapper } from '../../components/layout/PageWrapper';
import { Card, Button, Input } from '../../components/ui';
import { useTriggerOrder, useDispatchEmail } from '../../hooks/useAutomations';
import { useMealPlans } from '../../hooks/useMealPlans';

interface Job {
  id: string;
  workflow: string;
  client: string;
  status: 'completed' | 'pending' | 'failed' | 'running';
  time: string;
}

export function AutomationPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<string>('');
  
  const triggerOrderMutation = useTriggerOrder();
  const dispatchEmailMutation = useDispatchEmail();
  const { data: mealPlans = [], isLoading: plansLoading } = useMealPlans();

  const triggerOrderWebhook = () => {
    triggerOrderMutation.mutate(undefined, {
      onSuccess: () => {
        const newJob: Job = {
          id: Math.random().toString(),
          workflow: 'Ingredient Order (n8n Webhook)',
          client: 'Manual Trigger',
          status: 'completed',
          time: 'Just now'
        };
        setJobs([newJob, ...jobs]);
      },
      onError: () => {
        const newJob: Job = {
          id: Math.random().toString(),
          workflow: 'Ingredient Order (n8n Webhook)',
          client: 'Manual Trigger',
          status: 'failed',
          time: 'Just now'
        };
        setJobs([newJob, ...jobs]);
      }
    });
  };

  const handleDispatchEmail = () => {
    if (!selectedPlan) return;
    dispatchEmailMutation.mutate({ plan: selectedPlan }, {
      onSuccess: () => {
        const plan = mealPlans.find((p: any) => p.id === selectedPlan);
        const newJob: Job = {
          id: Math.random().toString(),
          workflow: 'Send Meal Plan PDF',
          client: plan?.client_name || selectedPlan,
          status: 'completed',
          time: 'Just now'
        };
        setJobs([newJob, ...jobs]);
      }
    });
  };

  const statusColors = {
    completed: 'text-teal-600 bg-teal-50 border-teal-200',
    pending: 'text-amber-600 bg-amber-50 border-amber-200',
    failed: 'text-rose-600 bg-rose-50 border-rose-200',
    running: 'text-blue-600 bg-blue-50 border-blue-200 animate-pulse'
  };

  return (
    <>
      <TopBar title="Automation Hub" subtitle="Configure workflows and monitor jobs" />
      <PageWrapper>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left: Workflow Configuration Tools */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Quick Actions / Webhooks */}
            <Card>
              <Card.Header>
                <div className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-accent-amber" />
                  <Card.Title>Quick Triggers</Card.Title>
                </div>
              </Card.Header>
              <Card.Body className="p-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Order Webhook Trigger */}
                  <div className="p-4 border border-border-subtle rounded-lg bg-bg-surface hover:border-brand-primary/50 transition-colors">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center">
                        <ShoppingCart className="w-4 h-4 text-blue-600" />
                      </div>
                      <h4 className="text-sm font-semibold text-text-primary">Trigger Ingredient Order</h4>
                    </div>
                    <p className="text-xs text-text-secondary mb-4">Fire n8n webhook to extract and dispatch meal plan ingredients for ordering.</p>
                    <Button 
                      size="sm" 
                      onClick={triggerOrderWebhook} 
                      disabled={triggerOrderMutation.isPending}
                      className="w-full"
                      icon={triggerOrderMutation.isSuccess ? <CheckCircle2 className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    >
                      {triggerOrderMutation.isPending ? 'Firing Webhook...' : triggerOrderMutation.isSuccess ? 'Order Dispatched' : 'Run Automation'}
                    </Button>
                  </div>

                  {/* Manual Meal Plan Sender */}
                  <div className="p-4 border border-border-subtle rounded-lg bg-bg-surface hover:border-brand-primary/50 transition-colors">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-8 h-8 rounded-full bg-brand-primary/10 flex items-center justify-center">
                        <FileText className="w-4 h-4 text-brand-primary" />
                      </div>
                      <h4 className="text-sm font-semibold text-text-primary">Send Meal Plan to Client</h4>
                    </div>
                    <p className="text-xs text-text-secondary mb-4">Generate PDF and email to associated client immediately via SendGrid.</p>
                    <div className="flex gap-2">
                      <select 
                        value={selectedPlan}
                        onChange={(e) => setSelectedPlan(e.target.value)}
                        className="flex-1 bg-bg-input border border-border-subtle rounded-md px-2 py-1 text-sm focus:outline-none focus:border-brand-primary"
                      >
                        <option value="">{plansLoading ? 'Loading plans...' : 'Select Plan...'}</option>
                        {mealPlans.map((plan: any) => (
                          <option key={plan.id} value={plan.id}>
                            {plan.title || plan.client_name || plan.id}
                          </option>
                        ))}
                      </select>
                      <Button 
                        size="sm" 
                        variant="secondary" 
                        onClick={handleDispatchEmail}
                        disabled={!selectedPlan || dispatchEmailMutation.isPending}
                        icon={<Send className="w-4 h-4" />}
                      >
                        {dispatchEmailMutation.isPending ? 'Sending...' : 'Send'}
                      </Button>
                    </div>
                  </div>
                </div>
              </Card.Body>
            </Card>

            {/* Config: Email Sequences */}
            <Card>
              <Card.Header>
                <div className="flex items-center gap-2">
                  <Send className="w-5 h-5 text-text-muted" />
                  <Card.Title>Email Sequences & Reminders</Card.Title>
                </div>
              </Card.Header>
              <Card.Body className="p-0">
                <div className="divide-y divide-border-subtle">
                  
                  {/* Sequence 1 */}
                  <div className="p-5">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h4 className="text-sm font-semibold text-text-primary">Client Onboarding Sequence</h4>
                        <p className="text-xs text-text-secondary">Sent automatically when a new client profile is created.</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" defaultChecked />
                        <div className="w-9 h-5 bg-border-strong rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-border-subtle after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-brand-primary"></div>
                      </label>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div className="text-xs border border-border-subtle rounded px-3 py-2 bg-bg-elevated">
                        <span className="font-semibold text-brand-primary block mb-1">Day 1</span>
                        Welcome & Intake Form Link
                      </div>
                      <div className="text-xs border border-border-subtle rounded px-3 py-2 bg-bg-elevated">
                        <span className="font-semibold text-brand-primary block mb-1">Day 3</span>
                        How to use the Portal
                      </div>
                      <button className="flex items-center justify-center text-xs text-text-muted border border-dashed border-border-subtle rounded px-3 py-2 hover:border-brand-primary hover:text-brand-primary transition-colors">
                        + Add Step
                      </button>
                    </div>
                  </div>

                  {/* Sequence 2 */}
                  <div className="p-5">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h4 className="text-sm font-semibold text-text-primary">Follow-up Reminders</h4>
                        <p className="text-xs text-text-secondary">Check-in triggers for active clients on meal plans.</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" defaultChecked />
                        <div className="w-9 h-5 bg-border-strong rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-border-subtle after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-brand-primary"></div>
                      </label>
                    </div>
                    <div className="flex items-center gap-3 bg-bg-elevated p-3 rounded-md border border-border-subtle">
                      <CalendarClock className="w-5 h-5 text-text-muted flex-shrink-0" />
                      <div className="flex-1 text-sm flex items-center gap-2">
                        Send a
                        <select className="bg-bg-input border border-border-subtle rounded px-2 py-1 text-xs outline-none focus:border-brand-primary">
                          <option>SMS Text</option>
                          <option>Email</option>
                        </select>
                        every
                        <Input type="number" value={14} className="w-16 h-7 text-xs text-center p-0" />
                        days after active consultation.
                      </div>
                    </div>
                  </div>

                </div>
              </Card.Body>
            </Card>

          </div>

          {/* Right: Job Status & History */}
          <div className="space-y-6">
            <Card className="h-full">
              <Card.Header className="flex items-center justify-between pb-4 border-b border-border-subtle">
                <div className="flex items-center gap-2">
                  <RefreshCw className="w-4 h-4 text-text-muted" />
                  <Card.Title>Job History</Card.Title>
                </div>
                <Button variant="ghost" size="sm" className="hidden sm:flex text-brand-primary hover:bg-brand-primary/10 -mr-2 px-2 h-7 text-xs">View Log</Button>
              </Card.Header>
              <Card.Body className="p-0">
                <div className="divide-y divide-border-subtle">
                  {jobs.map((job, idx) => (
                    <motion.div 
                      key={job.id} 
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className="p-4 hover:bg-bg-surface/50 transition-colors"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="text-sm font-semibold text-text-primary pr-4">{job.workflow}</h4>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${statusColors[job.status]}`}>
                          {job.status}
                        </span>
                      </div>
                      <div className="flex justify-between items-center mt-1 text-xs text-text-secondary">
                        <span className="flex items-center gap-1.5"><Clock className="w-3 h-3" /> {job.time}</span>
                        <span>{job.client}</span>
                      </div>
                    </motion.div>
                  ))}
                </div>
                {jobs.length === 0 && (
                  <div className="p-8 text-center text-text-muted text-sm">
                    No recent automation jobs.
                  </div>
                )}
              </Card.Body>
            </Card>
          </div>

        </div>
      </PageWrapper>
    </>
  );
}
