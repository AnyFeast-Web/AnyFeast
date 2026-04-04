import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Users, Calendar as CalendarIcon, FileText, Activity,
  AlertTriangle, Clock, Plus, ArrowRight, CheckCircle2,
  TrendingUp
} from 'lucide-react';
import { TopBar } from '../../components/layout/TopBar';
import { PageWrapper } from '../../components/layout/PageWrapper';
import { Card, Button, Avatar, Badge, StatusBadge } from '../../components/ui';
import { useDashboardStats } from '../../hooks/useDashboard';

const fallbackIcons: Record<string, any> = {
  meal_plan: FileText,
  consultation: CheckCircle2,
  client: Users,
  default: Activity,
};

const fallbackColors: Record<string, { color: string; bg: string }> = {
  meal_plan: { color: 'text-brand-primary', bg: 'bg-brand-primary/10' },
  consultation: { color: 'text-teal-600', bg: 'bg-teal-50' },
  client: { color: 'text-blue-600', bg: 'bg-blue-50' },
  default: { color: 'text-brand-primary', bg: 'bg-brand-primary/10' },
};

export function DashboardPage() {
  const navigate = useNavigate();
  const { data: stats, isLoading, error } = useDashboardStats();

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="w-8 h-8 border-4 border-brand-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center text-accent-rose">
        Failed to load dashboard data.
      </div>
    );
  }

  const recentActivity: any[] = stats?.recent_activity || [];
  const urgentAlerts: any[] = stats?.urgent_alerts || [];

  return (
    <>
      <TopBar
        title="Dashboard"
        subtitle="Overview of your practice and client activity"
        actions={
          <div className="flex gap-2">
            <Button variant="secondary" icon={<CalendarIcon className="w-4 h-4" />}>
              Schedule
            </Button>
            <Button icon={<Plus className="w-4 h-4" />} onClick={() => navigate('/clients')}>
              Quick Actions
            </Button>
          </div>
        }
      />

      <PageWrapper>
        {/* TOP STATS */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card className="hover:shadow-md transition-shadow">
            <Card.Body className="p-5 flex items-center justify-between">
              <div>
                <p className="text-sm font-display font-medium text-text-secondary">Active Clients</p>
                <div className="flex items-end gap-2 mt-1">
                  <h3 className="text-2xl font-display font-bold text-text-primary">
                    {stats?.total_active_clients || 0}
                  </h3>
                </div>
              </div>
              <div className="w-12 h-12 rounded-full bg-brand-primary/10 flex items-center justify-center">
                <Users className="w-6 h-6 text-brand-primary" />
              </div>
            </Card.Body>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <Card.Body className="p-5 flex items-center justify-between">
              <div>
                <p className="text-sm font-display font-medium text-text-secondary">Pending Consults</p>
                <div className="flex items-end gap-2 mt-1">
                  <h3 className="text-2xl font-display font-bold text-text-primary">{stats?.pending_consultations || 0}</h3>
                  <span className="text-xs text-text-muted mb-1">This week</span>
                </div>
              </div>
              <div className="w-12 h-12 rounded-full bg-accent-amber/10 flex items-center justify-center">
                <Clock className="w-6 h-6 text-accent-amber" />
              </div>
            </Card.Body>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <Card.Body className="p-5 flex items-center justify-between">
              <div>
                <p className="text-sm font-display font-medium text-text-secondary">Active Meal Plans</p>
                <div className="flex items-end gap-2 mt-1">
                  <h3 className="text-2xl font-display font-bold text-text-primary">{stats?.active_meal_plans || 0}</h3>
                </div>
              </div>
              <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
            </Card.Body>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <Card.Body className="p-5 flex items-center justify-between">
              <div>
                <p className="text-sm font-display font-medium text-text-secondary">Compliance Rate</p>
                <div className="flex items-end gap-2 mt-1">
                  <h3 className="text-2xl font-display font-bold text-text-primary">{stats?.compliance_rate || 0}%</h3>
                  <span className="text-xs text-text-muted mb-1">Avg. across clients</span>
                </div>
              </div>
              <div className="w-12 h-12 rounded-full bg-teal-50 flex items-center justify-center">
                <Activity className="w-6 h-6 text-teal-600" />
              </div>
            </Card.Body>
          </Card>
        </div>

        {/* ALERTS SECTION */}
        {urgentAlerts.length > 0 && (
          <div className="mb-6">
            <h2 className="text-base font-display font-semibold text-text-primary mb-3">Attention Needed</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {urgentAlerts.map((alert: any, idx: number) => (
                <div key={alert.id || idx} className={`flex items-start gap-3 p-4 rounded-lg border ${
                  alert.type === 'critical' 
                    ? 'bg-accent-rose/5 border-accent-rose/20' 
                    : 'bg-accent-amber/5 border-accent-amber/20'
                }`}>
                  <AlertTriangle className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                    alert.type === 'critical' ? 'text-accent-rose' : 'text-accent-amber'
                  }`} />
                  <div className="flex-1 min-w-0">
                    <h4 className={`text-sm font-semibold ${
                      alert.type === 'critical' ? 'text-accent-rose' : 'text-accent-amber'
                    }`}>{alert.title}</h4>
                    <p className="text-sm mt-0.5 opacity-80">{alert.desc || alert.description}</p>
                  </div>
                  <Button size="sm" variant="secondary" className="flex-shrink-0 bg-white shadow-sm border-border-subtle hover:bg-bg-surface text-xs h-7 py-0 px-3">
                    Resolve
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* MAIN SPLIT */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* LEFT: Dashboard Columns */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Quick Actions */}
            <Card>
              <Card.Header>
                <Card.Title>Quick Actions</Card.Title>
              </Card.Header>
              <Card.Body className="p-5">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <button onClick={() => navigate('/clients')} className="flex flex-col items-center justify-center p-4 rounded-xl border border-border-subtle bg-bg-surface hover:border-brand-primary hover:bg-brand-primary/5 transition-all text-center group">
                    <div className="w-10 h-10 rounded-full bg-brand-primary/10 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                      <Users className="w-5 h-5 text-brand-primary" />
                    </div>
                    <span className="text-sm font-medium text-text-primary">Add Client</span>
                  </button>
                  <button onClick={() => navigate('/meal-plans')} className="flex flex-col items-center justify-center p-4 rounded-xl border border-border-subtle bg-bg-surface hover:border-blue-500 hover:bg-blue-50 transition-all text-center group">
                    <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                      <FileText className="w-5 h-5 text-blue-600" />
                    </div>
                    <span className="text-sm font-medium text-text-primary">New Plan</span>
                  </button>
                  <button onClick={() => navigate('/consultations')} className="flex flex-col items-center justify-center p-4 rounded-xl border border-border-subtle bg-bg-surface hover:border-teal-500 hover:bg-teal-50 transition-all text-center group">
                    <div className="w-10 h-10 rounded-full bg-teal-50 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                      <Activity className="w-5 h-5 text-teal-600" />
                    </div>
                    <span className="text-sm font-medium text-text-primary">Consultation</span>
                  </button>
                  <button onClick={() => navigate('/nutrition-db')} className="flex flex-col items-center justify-center p-4 rounded-xl border border-border-subtle bg-bg-surface hover:border-amber-500 hover:bg-amber-50 transition-all text-center group">
                    <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                      <Plus className="w-5 h-5 text-amber-600" />
                    </div>
                    <span className="text-sm font-medium text-text-primary">Add Food</span>
                  </button>
                </div>
              </Card.Body>
            </Card>

          </div>

          {/* RIGHT: Activity Feed */}
          <div className="space-y-6">
            <Card className="h-full">
              <Card.Header>
                <Card.Title>Recent Activity</Card.Title>
              </Card.Header>
              <Card.Body className="p-5">
                {recentActivity.length > 0 ? (
                  <div className="relative border-l border-border-subtle ml-3 space-y-6 pb-2">
                    {recentActivity.map((activity: any, idx: number) => {
                      const actType = activity.type || 'default';
                      const Icon = fallbackIcons[actType] || fallbackIcons.default;
                      const colors = fallbackColors[actType] || fallbackColors.default;
                      return (
                        <motion.div 
                          initial={{ opacity: 0, x: 10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.1 }}
                          key={activity.id || idx} 
                          className="relative pl-6"
                        >
                          <div className={`absolute -left-[1.1rem] top-0.5 w-8 h-8 rounded-full border-4 border-bg-base ${colors.bg} flex items-center justify-center`}>
                            <Icon className={`w-3.5 h-3.5 ${colors.color}`} />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-text-primary">{activity.title}</p>
                            <p className="text-sm text-brand-primary hover:underline cursor-pointer inline-block mt-0.5 font-medium">{activity.client || activity.client_name}</p>
                            <p className="text-xs text-text-muted mt-1">{activity.time || activity.created_at}</p>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center text-text-muted text-sm py-8">
                    No recent activity yet.
                  </div>
                )}
                
                <Button variant="ghost" className="w-full mt-4 text-text-secondary hover:text-text-primary">
                  View Full History
                </Button>
              </Card.Body>
            </Card>
          </div>

        </div>
      </PageWrapper>
    </>
  );
}
