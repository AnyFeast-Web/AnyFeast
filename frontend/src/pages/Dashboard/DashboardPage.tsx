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
            <Button 
              variant="secondary" 
              icon={<CalendarIcon className="w-4 h-4" />}
              onClick={() => navigate('/consultations')}
            >
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
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
        </div>

        {/* MAIN AREA */}
        <div className="space-y-8">
          {/* Quick Actions */}
          <Card>
            <Card.Header>
              <Card.Title>Quick Actions</Card.Title>
            </Card.Header>
            <Card.Body className="p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <button 
                  onClick={() => navigate('/clients')} 
                  className="flex items-center gap-4 p-5 rounded-2xl border border-border-subtle bg-bg-surface hover:border-brand-primary hover:bg-brand-primary/5 transition-all group"
                >
                  <div className="w-14 h-14 rounded-full bg-brand-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Users className="w-7 h-7 text-brand-primary" />
                  </div>
                  <div className="text-left">
                    <span className="block text-base font-semibold text-text-primary">Add Client</span>
                    <p className="text-xs text-text-secondary mt-0.5">Register a new client profile</p>
                  </div>
                </button>

                <button 
                  onClick={() => navigate('/consultations')} 
                  className="flex items-center gap-4 p-5 rounded-2xl border border-border-subtle bg-bg-surface hover:border-teal-500 hover:bg-teal-50 transition-all group"
                >
                  <div className="w-14 h-14 rounded-full bg-teal-50 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Activity className="w-7 h-7 text-teal-600" />
                  </div>
                  <div className="text-left">
                    <span className="block text-base font-semibold text-text-primary">Consultation</span>
                    <p className="text-xs text-text-secondary mt-0.5">Start a new client session</p>
                  </div>
                </button>
              </div>
            </Card.Body>
          </Card>

          {/* ALERTS SECTION */}
          {urgentAlerts.length > 0 && (
            <div>
              <h2 className="text-base font-display font-semibold text-text-primary mb-3">Attention Needed</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </PageWrapper>
    </>
  );
}
