import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { PlusCircle, Search, Eye, Filter, Calendar, ClipboardList, MessageSquare } from 'lucide-react';
import { TopBar } from '../../components/layout/TopBar';
import { PageWrapper } from '../../components/layout/PageWrapper';
import { Avatar, Badge, StatusBadge, Button, Input, Card } from '../../components/ui';
import { useConsultations } from '../../hooks/useConsultations';
import { useClients } from '../../hooks/useClients';
import { formatDate } from '../../utils/formatters';
import { WhatsAppChatInterface } from '../../components/consultations/WhatsAppChatInterface';

type ConsultationItem = {
  id: string;
  clientId: string;
  clientName: string;
  date: string;
  type: 'structured' | 'chat';
  status: string;
  summary: string;
  nutritionist: string;
};

export function ConsultationHistoryPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<'All' | 'structured' | 'chat'>('All');

  const { data: rawConsultations = [], isLoading, error } = useConsultations();
  const { data: clients = [] } = useClients();

  // Combine and format all consultations
  const allConsultations: ConsultationItem[] = (rawConsultations as any[]).map((c) => {
    const client = clients.find((cl) => cl.id === c.client_id);
    const clientName = client 
      ? `${client.personal_info.first_name} ${client.personal_info.last_name}` 
      : 'Unknown Client';
    return {
      id: c.id,
      clientId: c.client_id,
      clientName: clientName,
      date: c.scheduled_at || c.created_at || new Date().toISOString(),
      type: (c as any).type || 'structured',
      status: (c as any).status || 'draft',
      summary: (c as any).summary_notes || 'No summary notes recorded',
      nutritionist: c.nutritionist_name || 'You',
    };
  }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // Filter logic
  const filteredConsultations = allConsultations.filter((c) => {
    const q = search.toLowerCase().trim();
    const matchesSearch = !q || c.clientName.toLowerCase().includes(q) || c.summary.toLowerCase().includes(q);
    const matchesType = typeFilter === 'All' || c.type === typeFilter;
    return matchesSearch && matchesType;
  });

  return (
    <>
      <TopBar
        title="Consultation History"
        subtitle="Browse all client sessions and notes"
        actions={
          <Button icon={<PlusCircle className="w-4 h-4" />} onClick={() => navigate('/clients')}>
            New Consultation
          </Button>
        }
      />

      <PageWrapper>
        <div className="flex flex-col gap-6">
          {/* Tabs / Filters Header */}
          <div className="flex items-center justify-between bg-bg-surface border border-border-subtle p-2 rounded-xl">
            <div className="flex bg-bg-elevated p-1 rounded-lg">
              {[
                { id: 'All', label: 'All Records' },
                { id: 'structured', label: 'Structured' },
                { id: 'chat', label: 'WhatsApp' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setTypeFilter(tab.id as any)}
                  className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
                    typeFilter === tab.id
                      ? 'bg-bg-surface text-text-primary shadow-sm'
                      : 'text-text-secondary hover:text-text-primary'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {typeFilter !== 'chat' && (
              <div className="flex items-center gap-2 pr-2">
                <div className="relative w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                  <Input
                    placeholder="Search records..."
                    className="pl-9 h-9 text-sm"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
                <Button variant="secondary" size="sm" icon={<Filter className="w-4 h-4" />}>Filters</Button>
              </div>
            )}
          </div>

          {typeFilter === 'chat' ? (
            <WhatsAppChatInterface />
          ) : (
            <Card>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-border-subtle bg-bg-surface/50">
                      <th className="px-5 py-3 text-xs font-display font-semibold text-text-secondary uppercase tracking-wider">
                        Client & Date
                      </th>
                      <th className="px-5 py-3 text-xs font-display font-semibold text-text-secondary uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-5 py-3 text-xs font-display font-semibold text-text-secondary uppercase tracking-wider">
                        Summary Notes
                      </th>
                      <th className="px-5 py-3 text-xs font-display font-semibold text-text-secondary uppercase tracking-wider">
                        Nutritionist
                      </th>
                      <th className="px-5 py-3 text-xs font-display font-semibold text-text-secondary uppercase tracking-wider text-right">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-subtle">
                    {isLoading && (
                      <tr>
                        <td colSpan={5} className="px-5 py-8 text-center text-text-muted">
                          <div className="flex justify-center mb-2">
                            <div className="w-6 h-6 border-4 border-brand-primary border-t-transparent rounded-full animate-spin" />
                          </div>
                          Loading consultations...
                        </td>
                      </tr>
                    )}
                    {error && (
                      <tr>
                        <td colSpan={5} className="px-5 py-8 text-center text-accent-rose">
                          Failed to load consultation history.
                        </td>
                      </tr>
                    )}
                    {!isLoading && !error && filteredConsultations.map((consultation, i) => (
                      <motion.tr
                        key={consultation.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05, duration: 0.2 }}
                        className="group hover:bg-bg-surface/50 transition-colors"
                      >
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <Avatar name={consultation.clientName} size="sm" />
                            <div>
                              <p className="text-sm font-display font-medium text-text-primary">{consultation.clientName}</p>
                              <div className="flex items-center gap-1 mt-0.5 text-xs text-text-muted">
                                <Calendar className="w-3 h-3" />
                                {formatDate(consultation.date)}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2">
                            {consultation.type === 'structured' ? (
                              <Badge variant={consultation.status === 'completed' ? 'teal' : 'amber'} size="sm">
                                <span className="flex items-center gap-1.5">
                                  <ClipboardList className="w-3 h-3" />
                                  Structured ({consultation.status})
                                </span>
                              </Badge>
                            ) : (
                              <Badge variant="blue" size="sm">
                                <span className="flex items-center gap-1.5">
                                  <MessageSquare className="w-3 h-3" />
                                  Chat Session
                                </span>
                              </Badge>
                            )}
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <p className="text-sm text-text-secondary line-clamp-2 max-w-md">
                            {consultation.summary}
                          </p>
                        </td>
                        <td className="px-5 py-4">
                          <p className="text-sm text-text-secondary">{consultation.nutritionist}</p>
                        </td>
                        <td className="px-5 py-4 text-right">
                          <Button
                            variant="secondary"
                            size="sm"
                            icon={<Eye className="w-4 h-4" />}
                            onClick={() => {
                              if (consultation.type === 'structured') {
                                navigate(`/consultations/${consultation.id}/edit`);
                              } else {
                                setTypeFilter('chat');
                              }
                            }}
                          >
                            View
                          </Button>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {filteredConsultations.length === 0 && !isLoading && !error && (
                <div className="flex flex-col items-center justify-center py-16">
                  <Search className="w-12 h-12 text-text-muted mb-4" />
                  <p className="text-text-secondary font-display font-medium">No consultations found</p>
                  <p className="text-sm text-text-muted mt-1">Try adjusting your search or filters</p>
                </div>
              )}
            </Card>
          )}
        </div>
      </PageWrapper>
    </>
  );
}
