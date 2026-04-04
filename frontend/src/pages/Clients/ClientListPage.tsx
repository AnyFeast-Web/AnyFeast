import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { PlusCircle, Search, Eye, Edit2, Users, Trash2 } from 'lucide-react';
import { TopBar } from '../../components/layout/TopBar';
import { PageWrapper } from '../../components/layout/PageWrapper';
import { Card, Button, Input, Avatar, GoalBadge, StatusBadge, Badge } from '../../components/ui';
import { useClients, useCreateClient, useUpdateClient, useDeleteClient } from '../../hooks/useClients';
import { Client } from '../../types';

const filterTabs = ['All', 'Active', 'Inactive'] as const;
const goalFilters = ['Fat Loss', 'Diabetic', 'Athlete', 'Maintenance'] as const;

export function ClientListPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [goalFilter, setGoalFilter] = useState<string | null>(null);

  const { data: clients = [], isLoading, error } = useClients();

  // Modal / form states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClientId, setEditingClientId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<Client>>({});

  const createMutation = useCreateClient();
  const updateMutation = useUpdateClient(editingClientId || '');
  const deleteMutation = useDeleteClient();

  const handleOpenNew = () => {
    setEditingClientId(null);
    setFormData({ 
      name: '', email: '', phone: '', status: 'active', age: 30, gender: 'female', tags: [] 
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (client: Client) => {
    setEditingClientId(client.id);
    setFormData(client);
    setIsModalOpen(true);
  };

  const handleDelete = (client: Client) => {
    if (window.confirm(`Are you sure you want to delete ${client.name}?`)) {
      deleteMutation.mutate(client.id);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingClientId) {
      updateMutation.mutate(formData, {
        onSuccess: () => setIsModalOpen(false)
      });
    } else {
      createMutation.mutate(formData as any, {
        onSuccess: () => setIsModalOpen(false)
      });
    }
  };

  const filteredClients = clients.filter((client: Client) => {
    const q = search.toLowerCase().trim();
    const matchesSearch = !q || 
      client.name.toLowerCase().includes(q) ||
      (client.email?.toLowerCase().includes(q) ?? false) ||
      (client.phone?.replace(/\s/g, '').includes(q.replace(/\s/g, '')) ?? false) ||
      (client.customer_id?.toLowerCase().includes(q) ?? false);
    const matchesStatus = statusFilter === 'All' || client.status === statusFilter.toLowerCase();
    const matchesGoal = !goalFilter || (client.tags && client.tags.includes(goalFilter));
    return matchesSearch && matchesStatus && matchesGoal;
  });

  return (
    <>
      <TopBar
        title="Clients"
        subtitle={`${clients.length} total clients`}
        actions={
          <Button icon={<PlusCircle className="w-4 h-4" />} size="sm" onClick={handleOpenNew}>
            New Client
          </Button>
        }
      />

      <PageWrapper>
        {isLoading ? (
          <div className="flex items-center justify-center p-12">
            <div className="w-8 h-8 border-4 border-brand-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : error ? (
          <div className="p-4 bg-accent-rose/10 text-accent-rose rounded-lg mt-6">
            Failed to load clients. Please check your connection.
          </div>
        ) : (
          <>
            {/* Filters Bar */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6">
              <div className="w-full sm:w-80">
                <Input
                  variant="search"
                  placeholder="Search by name, email, phone..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              <div className="flex items-center gap-2">
                {filterTabs.map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setStatusFilter(tab)}
                    className={`px-3 py-1.5 rounded-full text-xs font-display font-medium transition-all ${
                      statusFilter === tab
                        ? 'bg-brand-primary/10 text-brand-primary border border-brand-primary/30'
                        : 'bg-bg-elevated text-text-secondary border border-border-subtle hover:text-text-primary'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2">
                {goalFilters.map((goal) => (
                  <button
                    key={goal}
                    onClick={() => setGoalFilter(goalFilter === goal ? null : goal)}
                    className={`px-3 py-1.5 rounded-full text-xs font-display font-medium transition-all ${
                      goalFilter === goal
                        ? 'bg-accent-amber/10 text-accent-amber border border-accent-amber/30'
                        : 'bg-bg-elevated text-text-secondary border border-border-subtle hover:text-text-primary'
                    }`}
                  >
                    {goal}
                  </button>
                ))}
              </div>
            </div>

            {/* Client Table */}
            <Card hover={false}>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-bg-elevated">
                      <th className="text-left text-xs font-display font-medium text-text-secondary px-5 py-3 rounded-l-md">Client</th>
                      <th className="text-left text-xs font-display font-medium text-text-secondary px-5 py-3">Age</th>
                      <th className="text-left text-xs font-display font-medium text-text-secondary px-5 py-3">Goal</th>
                      <th className="text-left text-xs font-display font-medium text-text-secondary px-5 py-3">Conditions</th>
                      <th className="text-left text-xs font-display font-medium text-text-secondary px-5 py-3">Last Active</th>
                      <th className="text-left text-xs font-display font-medium text-text-secondary px-5 py-3">Status</th>
                      <th className="text-left text-xs font-display font-medium text-text-secondary px-5 py-3 rounded-r-md">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredClients.map((client, i) => (
                      <motion.tr
                        key={client.id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.04, duration: 0.3 }}
                        className="border-b border-border-subtle hover:bg-white/[0.02] transition-colors group cursor-pointer"
                        onClick={() => navigate(`/clients/${client.id}`)}
                      >
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <Avatar name={client.name} size="md" active={client.status === 'active'} />
                            <div>
                              <p className="text-sm font-display font-medium text-text-primary">{client.name}</p>
                              <p className="text-xs text-text-secondary">{client.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4 text-sm text-text-secondary">{client.age}</td>
                        <td className="px-5 py-4">
                          {client.goals && client.goals.length > 0 ? (
                            <GoalBadge goal={client.goals[0]} />
                          ) : (
                            <span className="text-xs text-text-muted">None</span>
                          )}
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex flex-wrap gap-1">
                            {client.personal_info?.conditions?.length > 0 ? (
                              client.personal_info.conditions.map((c: string) => (
                                <Badge key={c} variant="gray" size="sm">{c}</Badge>
                              ))
                            ) : (
                              <span className="text-xs text-text-muted">None</span>
                            )}
                          </div>
                        </td>
                        <td className="px-5 py-4 text-sm text-text-secondary">
                          {client.last_active ? client.last_active : 'New'}
                        </td>
                        <td className="px-5 py-4">
                          <StatusBadge status={client.status} />
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              className="p-1.5 rounded-md text-text-secondary hover:text-brand-primary hover:bg-brand-primary/10 transition-colors"
                              onClick={(e) => { e.stopPropagation(); navigate(`/clients/${client.id}`); }}
                              title="View"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              className="p-1.5 rounded-md text-text-secondary hover:text-accent-blue hover:bg-accent-blue/10 transition-colors"
                              onClick={(e) => { e.stopPropagation(); handleOpenEdit(client); }}
                              title="Edit"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              className="p-1.5 rounded-md text-text-secondary hover:text-accent-rose hover:bg-accent-rose/10 transition-colors"
                              onClick={(e) => { e.stopPropagation(); handleDelete(client); }}
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {filteredClients.length === 0 && (
                <div className="flex flex-col items-center justify-center py-16">
                  <Users className="w-12 h-12 text-text-muted mb-4" />
                  <p className="text-text-secondary font-display font-medium">No clients found</p>
                  <p className="text-sm text-text-muted mt-1">Try adjusting your search or filters</p>
                  <Button className="mt-4" icon={<PlusCircle className="w-4 h-4" />} onClick={handleOpenNew}>
                    Add your first client
                  </Button>
                </div>
              )}
            </Card>
          </>
        )}
      </PageWrapper>

      {/* New/Edit Client Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-bg-inverse/20 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }} 
              animate={{ opacity: 1, scale: 1 }} 
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-bg-surface border border-border-subtle rounded-xl p-6 w-full max-w-lg shadow-xl"
            >
              <h3 className="text-lg font-display font-semibold text-text-primary mb-4">
                {editingClientId ? 'Edit Client' : 'Add New Client'}
              </h3>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <Input 
                  label="Full Name" 
                  placeholder="e.g. Jane Doe" 
                  value={formData.name || ''} 
                  onChange={e => setFormData({...formData, name: e.target.value})} 
                  required 
                />
                
                <div className="grid grid-cols-2 gap-4">
                  <Input 
                    label="Email Address" 
                    type="email"
                    placeholder="jane@example.com" 
                    value={formData.email || ''} 
                    onChange={e => setFormData({...formData, email: e.target.value})} 
                  />
                  <Input 
                    label="Phone Number" 
                    placeholder="+1 234 567 8900" 
                    value={formData.phone || ''} 
                    onChange={e => setFormData({...formData, phone: e.target.value})} 
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Input 
                    label="Age" 
                    type="number"
                    value={formData.age || ''} 
                    onChange={e => setFormData({...formData, age: Number(e.target.value)})} 
                  />
                  <div>
                    <label className="block text-xs font-display font-semibold text-text-secondary uppercase mb-1.5">Gender</label>
                    <select 
                      value={formData.gender || 'female'} 
                      onChange={e => setFormData({...formData, gender: e.target.value as any})}
                      className="w-full bg-bg-input border border-border-subtle rounded-md px-3.5 py-2.5 text-sm font-body text-text-primary focus:border-brand-primary focus:outline-none transition-colors"
                    >
                      <option value="female">Female</option>
                      <option value="male">Male</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-display font-semibold text-text-secondary uppercase mb-1.5">Status</label>
                  <select 
                    value={formData.status || 'active'} 
                    onChange={e => setFormData({...formData, status: e.target.value as any})}
                    className="w-full bg-bg-input border border-border-subtle rounded-md px-3.5 py-2.5 text-sm font-body text-text-primary focus:border-brand-primary focus:outline-none transition-colors"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>

                <div className="flex gap-3 mt-8 pt-4 border-t border-border-subtle">
                  <Button type="button" variant="secondary" className="flex-1" onClick={() => setIsModalOpen(false)}>
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    className="flex-1" 
                    disabled={createMutation.isPending || updateMutation.isPending}
                  >
                    {createMutation.isPending || updateMutation.isPending 
                      ? 'Saving...' 
                      : (editingClientId ? 'Update Client' : 'Create Client')
                    }
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
