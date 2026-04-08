import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft, CalendarDays, MessageSquare, TrendingUp,
  Mail, Phone, Weight, Ruler, Activity, ClipboardList,
  Clock, User, FileText, ChevronRight, PlusCircle, Search,
} from 'lucide-react';
import { TopBar } from '../../components/layout/TopBar';
import { PageWrapper } from '../../components/layout/PageWrapper';
import { Card, Button, Avatar, Badge, GoalBadge, StatusBadge, Tabs, Input } from '../../components/ui';
import { MacroBar } from '../../components/nutrition/MacroBar';
import { useClient } from '../../hooks/useClients';
import { useMealPlans } from '../../hooks/useMealPlans';
import { useConsultations } from '../../hooks/useConsultations';
import { formatDate, formatTimeAgo, getGoalLabel, formatWeight, formatHeight } from '../../utils/formatters';
import { calculateBMR, calculateTDEE } from '../../utils/nutritionCalc';

const profileTabs = [
  { id: 'overview', label: 'Overview' },
  { id: 'meal-plans', label: 'Meal Plans' },
  { id: 'consultations', label: 'Consultations' },
  { id: 'progress', label: 'Progress' },
];

export function ClientProfilePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [consultationSearch, setConsultationSearch] = useState('');

  const { data: client, isLoading: clientLoading, error: clientError } = useClient(id || '');
  const { data: allPlans = [] } = useMealPlans();
  const { data: allConsultations = [] } = useConsultations();

  if (clientLoading) {
    return (
      <>
        <TopBar title="Client Profile" />
        <PageWrapper>
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-4 border-brand-primary border-t-transparent rounded-full animate-spin" />
          </div>
        </PageWrapper>
      </>
    );
  }

  if (clientError || !client) {
    return (
      <>
        <TopBar title="Client Not Found" />
        <PageWrapper>
          <div className="flex flex-col items-center justify-center py-20">
            <p className="text-text-secondary">Client not found</p>
            <Button className="mt-4" variant="secondary" onClick={() => navigate('/clients')}>
              Back to Clients
            </Button>
          </div>
        </PageWrapper>
      </>
    );
  }

  const clientPlans = (allPlans as any[]).filter((p) => p.client_id === client.id);
  const clientConsultations = (allConsultations as any[]).filter((c) => c.client_id === client.id);
  const clientForms = clientConsultations.filter((c) => c.plan || c.medical_history);

  const dob = client.personal_info.dob ? new Date(client.personal_info.dob) : null;
  const age = dob ? Math.floor((Date.now() - dob.getTime()) / (365.25 * 24 * 60 * 60 * 1000)) : null;
  const weightKg = client.measurements?.weight_kg || 0;
  const heightCm = client.measurements?.height_cm || 0;
  const bmr = age && weightKg && heightCm ? calculateBMR('male', weightKg, heightCm, age) : 0;
  const tdee = calculateTDEE(bmr, 'moderate');

  // Filter consultation forms by search
  const filteredForms = clientForms.filter((f) => {
    if (!consultationSearch.trim()) return true;
    const q = consultationSearch.toLowerCase();
    return (
      f.plan?.free_notes?.toLowerCase().includes(q) ||
      f.plan?.priority_issues?.toLowerCase().includes(q) ||
      f.plan?.next_steps?.toLowerCase().includes(q) ||
      f.nutritionist_name?.toLowerCase().includes(q) ||
      formatDate(f.created_at).toLowerCase().includes(q)
    );
  });

  return (
    <>
      <TopBar title="Client Profile" />

      <PageWrapper>
        {/* Back Button */}
        <button
          onClick={() => navigate('/clients')}
          className="flex items-center gap-2 text-sm text-text-secondary hover:text-text-primary mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Clients
        </button>

        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-bg-surface border border-border-subtle rounded-lg p-6 mb-6"
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            <Avatar name={`${client.personal_info.first_name} ${client.personal_info.last_name}`} size="lg" active={client.status === 'active'} />
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-1">
                <h2 className="text-xl font-display font-bold text-text-primary">{client.personal_info.first_name} {client.personal_info.last_name}</h2>
                <StatusBadge status={client.status} />
              </div>
              <p className="text-sm text-text-secondary">{age ? `${age} years` : 'Age unknown'}</p>
              <div className="flex flex-wrap gap-2 mt-2">
                {client.goals.map((g) => (
                  <GoalBadge key={g} goal={g} />
                ))}
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                icon={<ClipboardList className="w-4 h-4" />}
                size="sm"
                onClick={() => navigate(`/consultations/new/${client.id}`)}
              >
                Start Consultation
              </Button>
              <Button icon={<CalendarDays className="w-4 h-4" />} size="sm" variant="secondary">Create Plan</Button>
            </div>
          </div>
        </motion.div>

        {/* Tabs */}
        <Tabs tabs={profileTabs} activeTab={activeTab} onChange={setActiveTab} className="mb-6" />

        {/* Tab Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {activeTab === 'overview' && (
              <>
                {/* Personal Info */}
                <Card>
                  <Card.Header>
                    <Card.Title>Personal Information</Card.Title>
                  </Card.Header>
                  <Card.Body>
                    <div className="grid grid-cols-2 gap-4">
                      {[
                        { icon: <Mail className="w-4 h-4" />, label: 'Email', value: client.personal_info?.email || 'N/A' },
                        { icon: <Phone className="w-4 h-4" />, label: 'Phone', value: client.personal_info?.phone || 'N/A' },
                        { icon: <Weight className="w-4 h-4" />, label: 'Weight', value: formatWeight(client.measurements?.weight_kg) },
                        { icon: <Ruler className="w-4 h-4" />, label: 'Height', value: formatHeight(client.measurements?.height_cm) },
                        { icon: <Activity className="w-4 h-4" />, label: 'BMR', value: `${Math.round(bmr)} kcal` },
                        { icon: <TrendingUp className="w-4 h-4" />, label: 'TDEE (Moderate)', value: `${Math.round(tdee)} kcal` },
                      ].map((item) => (
                        <div key={item.label} className="flex items-center gap-3 p-3 bg-bg-elevated rounded-md">
                          <div className="text-text-muted">{item.icon}</div>
                          <div>
                            <p className="text-xs text-text-muted">{item.label}</p>
                            <p className="text-sm text-text-primary font-medium">{item.value}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card.Body>
                </Card>

                {/* Diet Preferences */}
                <Card>
                  <Card.Header>
                    <Card.Title>Diet Preferences</Card.Title>
                  </Card.Header>
                  <Card.Body>
                    <div className="flex flex-wrap gap-2">
                      {client?.diet_preferences?.veg && <Badge variant="teal">Vegetarian</Badge>}
                      {client?.diet_preferences?.vegan && <Badge variant="teal">Vegan</Badge>}
                      {client?.diet_preferences?.halal && <Badge variant="blue">Halal</Badge>}
                      {client?.diet_preferences?.gluten_free && <Badge variant="amber">Gluten Free</Badge>}
                      {(client?.diet_preferences?.allergies || []).map((a) => (
                        <Badge key={a} variant="rose">Allergy: {a}</Badge>
                      ))}
                      {!client?.diet_preferences?.veg && !client?.diet_preferences?.vegan && 
                       !client?.diet_preferences?.halal && !client?.diet_preferences?.gluten_free &&
                       (client?.diet_preferences?.allergies || []).length === 0 && (
                        <span className="text-sm text-text-muted">No specific preferences</span>
                      )}
                    </div>
                  </Card.Body>
                </Card>

                {/* Onboarding Data Summary (Read-only) */}
                {clientForms.length > 0 && (
                  <Card>
                    <Card.Header>
                      <Card.Title>Latest Consultation Summary</Card.Title>
                      <Badge variant="teal" size="sm">Read-only</Badge>
                    </Card.Header>
                    <Card.Body>
                      {(() => {
                        const latest = clientForms[0];
                        return (
                          <div className="space-y-4">
                            {latest?.medical_history?.previous_diagnoses && (
                              <div>
                                <p className="text-xs font-display font-semibold text-text-muted uppercase mb-1">Medical History</p>
                                <p className="text-sm text-text-primary">{latest.medical_history.previous_diagnoses}</p>
                              </div>
                            )}
                            {latest?.plan?.priority_issues && (
                              <div>
                                <p className="text-xs font-display font-semibold text-text-muted uppercase mb-1">Priority Issues</p>
                                <p className="text-sm text-text-primary whitespace-pre-line">{latest.plan.priority_issues}</p>
                              </div>
                            )}
                            {latest?.plan?.next_steps && (
                              <div>
                                <p className="text-xs font-display font-semibold text-text-muted uppercase mb-1">Next Steps</p>
                                <p className="text-sm text-text-primary whitespace-pre-line">{latest.plan.next_steps}</p>
                              </div>
                            )}
                            {latest.blood_reports.markers.length > 0 && (
                              <div>
                                <p className="text-xs font-display font-semibold text-text-muted uppercase mb-2">Key Blood Markers</p>
                                <div className="flex flex-wrap gap-2">
                                  {latest.blood_reports.markers.map((m: any) => {
                                    const statusColors: Record<string, string> = {
                                      normal: 'bg-brand-primary/10 text-brand-primary',
                                      low: 'bg-accent-blue/10 text-accent-blue',
                                      high: 'bg-accent-amber/10 text-accent-amber',
                                      critical: 'bg-accent-rose/10 text-accent-rose',
                                    };
                                    return (
                                      <div
                                        key={m.id}
                                        className={`px-2.5 py-1.5 rounded-md text-xs font-medium ${statusColors[m.status] || 'bg-bg-input text-text-muted'}`}
                                      >
                                        {m.marker_name}: {m.value} {m.unit}
                                        {m.status && <span className="ml-1 opacity-70">({m.status})</span>}
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })()}
                    </Card.Body>
                  </Card>
                )}
              </>
            )}

            {activeTab === 'meal-plans' && (
              <Card>
                <Card.Header>
                  <Card.Title>Meal Plans</Card.Title>
                </Card.Header>
                <Card.Body>
                  {clientPlans.length > 0 ? (
                    <div className="space-y-3">
                      {clientPlans.map((plan) => (
                        <div
                          key={plan.id}
                          className="flex items-center justify-between p-4 bg-bg-elevated rounded-md border border-border-subtle hover:border-border-strong transition-colors cursor-pointer"
                          onClick={() => navigate(`/meal-plans/${plan.id}`)}
                        >
                          <div>
                            <p className="text-sm font-display font-medium text-text-primary">{plan.title}</p>
                            <p className="text-xs text-text-secondary mt-1">
                              v{plan.version} · {formatDate(plan.date_range.start)} — {formatDate(plan.date_range.end)}
                            </p>
                            <MacroBar
                              protein={plan.total_nutrition.protein_g}
                              carbs={plan.total_nutrition.carbs_g}
                              fat={plan.total_nutrition.fat_g}
                              showLabels={false}
                              height={4}
                              className="mt-2 w-32"
                            />
                          </div>
                          <div className="text-right">
                            <StatusBadge status={plan.status} />
                            <p className="mono-number text-sm text-brand-primary mt-2">{plan.total_nutrition.calories} kcal</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-text-muted text-center py-8">No meal plans yet</p>
                  )}
                </Card.Body>
              </Card>
            )}

            {activeTab === 'consultations' && (
              <div className="space-y-4">
                {/* Consultation Actions Bar */}
                <div className="flex items-center gap-3">
                  <div className="flex-1">
                    <Input
                      variant="search"
                      placeholder="Search consultation notes..."
                      value={consultationSearch}
                      onChange={(e) => setConsultationSearch(e.target.value)}
                    />
                  </div>
                  <Button
                    icon={<PlusCircle className="w-4 h-4" />}
                    size="sm"
                    onClick={() => navigate(`/consultations/new/${client.id}`)}
                  >
                    New Consultation
                  </Button>
                </div>

                {/* Consultation History Timeline */}
                <Card>
                  <Card.Header>
                    <Card.Title>Consultation History</Card.Title>
                    <Badge variant="blue" size="sm">{clientForms.length + clientConsultations.length} total</Badge>
                  </Card.Header>
                  <Card.Body>
                    {filteredForms.length > 0 || clientConsultations.length > 0 ? (
                      <div className="relative">
                        {/* Timeline line */}
                        <div className="absolute left-[17px] top-4 bottom-4 w-px bg-border-subtle" />

                        <div className="space-y-4">
                          {/* Structured consultation forms */}
                          {filteredForms.map((form) => (
                            <motion.div
                              key={form.id}
                              initial={{ opacity: 0, y: 8 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="relative flex gap-4 cursor-pointer group"
                              onClick={() => navigate(`/consultations/${form.id}/edit`)}
                            >
                              {/* Timeline dot */}
                              <div className="relative z-10 w-9 h-9 rounded-full bg-brand-primary/10 border-2 border-brand-primary/30 flex items-center justify-center flex-shrink-0 group-hover:bg-brand-primary/20 transition-colors">
                                <ClipboardList className="w-4 h-4 text-brand-primary" />
                              </div>
                              {/* Content */}
                              <div className="flex-1 p-4 bg-bg-elevated rounded-lg border border-border-subtle group-hover:border-brand-primary/30 group-hover:shadow-sm transition-all">
                                <div className="flex items-center justify-between mb-2">
                                  <div className="flex items-center gap-2">
                                    <p className="text-sm font-display font-semibold text-text-primary">
                                      Structured Consultation
                                    </p>
                                    <Badge variant={form.status === 'completed' ? 'teal' : 'amber'} size="sm">
                                      {form.status}
                                    </Badge>
                                  </div>
                                  <ChevronRight className="w-4 h-4 text-text-muted group-hover:text-brand-primary transition-colors" />
                                </div>
                                <div className="flex items-center gap-4 text-xs text-text-secondary mb-2">
                                  <span className="flex items-center gap-1">
                                    <Clock className="w-3.5 h-3.5" />
                                    {formatDate(form.created_at)}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <User className="w-3.5 h-3.5" />
                                    {form.nutritionist_name}
                                  </span>
                                </div>
                                {form?.plan?.priority_issues && (
                                  <p className="text-xs text-text-muted line-clamp-2">
                                    {form.plan.priority_issues.split('\n')[0]}
                                  </p>
                                )}
                                {form.blood_reports.markers.length > 0 && (
                                  <div className="flex gap-1.5 mt-2 flex-wrap">
                                    {form.blood_reports.markers
                                      .filter((m: any) => m.status === 'high' || m.status === 'low' || m.status === 'critical')
                                      .slice(0, 4)
                                      .map((m: any) => (
                                        <span
                                          key={m.id}
                                          className={`text-xs px-1.5 py-0.5 rounded ${
                                            m.status === 'critical' ? 'bg-accent-rose/10 text-accent-rose'
                                            : m.status === 'high' ? 'bg-accent-amber/10 text-accent-amber'
                                            : 'bg-accent-blue/10 text-accent-blue'
                                          }`}
                                        >
                                          {m.marker_name} {m.status}
                                        </span>
                                      ))}
                                  </div>
                                )}
                              </div>
                            </motion.div>
                          ))}

                          {/* Legacy chat-style consultations */}
                          {clientConsultations.map((con) => (
                            <motion.div
                              key={con.id}
                              initial={{ opacity: 0, y: 8 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="relative flex gap-4"
                            >
                              <div className="relative z-10 w-9 h-9 rounded-full bg-accent-blue/10 border-2 border-accent-blue/30 flex items-center justify-center flex-shrink-0">
                                <MessageSquare className="w-4 h-4 text-accent-blue" />
                              </div>
                              <div className="flex-1 p-4 bg-bg-elevated rounded-lg border border-border-subtle">
                                <div className="flex items-center justify-between mb-2">
                                  <p className="text-sm font-display font-medium text-text-primary">
                                    Chat Consultation
                                  </p>
                                  <Badge variant="blue" size="sm">{con.duration_min} min</Badge>
                                </div>
                                <div className="flex items-center gap-4 text-xs text-text-secondary mb-1">
                                  <span className="flex items-center gap-1">
                                    <Clock className="w-3.5 h-3.5" />
                                    {formatDate(con.date)}
                                  </span>
                                </div>
                                <p className="text-xs text-text-muted">{con.notes.goals}</p>
                                <p className="text-xs text-text-muted mt-1">{con.messages.length} messages</p>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-12">
                        <ClipboardList className="w-12 h-12 text-text-muted mb-4" />
                        <p className="text-text-secondary font-display">No consultations yet</p>
                        <p className="text-sm text-text-muted mt-1">Start a structured consultation to capture detailed health data</p>
                        <Button
                          className="mt-4"
                          icon={<PlusCircle className="w-4 h-4" />}
                          size="sm"
                          onClick={() => navigate(`/consultations/new/${client.id}`)}
                        >
                          Start First Consultation
                        </Button>
                      </div>
                    )}
                  </Card.Body>
                </Card>
              </div>
            )}

            {activeTab === 'progress' && (
              <Card>
                <Card.Header>
                  <Card.Title>Progress Tracking</Card.Title>
                </Card.Header>
                <Card.Body>
                  <div className="flex flex-col items-center justify-center py-12">
                    <TrendingUp className="w-12 h-12 text-text-muted mb-4" />
                    <p className="text-text-secondary font-display">Progress charts coming soon</p>
                    <p className="text-sm text-text-muted mt-1">Weight, BMI, and nutrition trends</p>
                  </div>
                </Card.Body>
              </Card>
            )}
          </div>

          {/* Sidebar — Activity Timeline */}
          <div className="space-y-6">
            <Card>
              <Card.Header>
                <Card.Title>Recent Activity</Card.Title>
              </Card.Header>
              <Card.Body>
                <div className="space-y-4">
                  {[
                    ...(clientForms.length > 0
                      ? [{ action: `Structured consultation (${clientForms[0].status})`, time: formatTimeAgo(clientForms[0].updated_at), type: 'consultation' }]
                      : []),
                    { action: 'Meal plan updated', time: '2 hours ago', type: 'plan' },
                    { action: 'Consultation completed', time: '2 days ago', type: 'consultation' },
                    { action: 'Weight logged: 72 kg', time: '3 days ago', type: 'progress' },
                    { action: 'New meal plan created', time: '1 week ago', type: 'plan' },
                  ].slice(0, 5).map((item, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className="w-2 h-2 rounded-full bg-brand-primary mt-2 flex-shrink-0" />
                      <div>
                        <p className="text-sm text-text-primary">{item.action}</p>
                        <p className="text-xs text-text-muted">{item.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card.Body>
            </Card>

            <Card>
              <Card.Header>
                <Card.Title>Quick Stats</Card.Title>
              </Card.Header>
              <Card.Body>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-text-secondary">Total Plans</span>
                    <span className="mono-number text-sm text-text-primary">{clientPlans.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-text-secondary">Consultations</span>
                    <span className="mono-number text-sm text-text-primary">{clientForms.length + clientConsultations.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-text-secondary">Member Since</span>
                    <span className="text-sm text-text-primary">{formatDate(client.created_at)}</span>
                  </div>
                  {clientForms.length > 0 && clientForms[0].plan.follow_up_date && (
                    <div className="flex justify-between">
                      <span className="text-sm text-text-secondary">Next Follow-up</span>
                      <span className="text-sm text-brand-primary font-medium">{formatDate(clientForms[0].plan.follow_up_date)}</span>
                    </div>
                  )}
                </div>
              </Card.Body>
            </Card>
          </div>
        </div>
      </PageWrapper>
    </>
  );
}
