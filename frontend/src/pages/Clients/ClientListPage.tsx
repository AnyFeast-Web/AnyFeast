import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { PlusCircle, Search, Eye, Edit2, Users, Trash2 } from 'lucide-react';
import { TopBar } from '../../components/layout/TopBar';
import { PageWrapper } from '../../components/layout/PageWrapper';
import { Card, Button, Input, Avatar, GoalBadge, StatusBadge, Badge } from '../../components/ui';
import { useClients, useCreateClient, useUpdateClient, useDeleteClient } from '../../hooks/useClients';
import { Client, CreateClientInput } from '../../types';

const filterTabs = ['All', 'Active', 'Inactive'] as const;

interface FormState {
  status: 'active' | 'inactive';
  personal_info: {
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    dob: string;
    age: string;
    gender: string;
  };
  goals: string;
  tags: string;
  measurements: {
    height_cm: string;
    weight_kg: string;
    activity_multiplier: string;
  };
}

const defaultForm: FormState = {
  status: 'active',
  personal_info: { first_name: '', last_name: '', email: '', phone: '', dob: '', age: '', gender: '' },
  goals: '',
  tags: '',
  measurements: { height_cm: '', weight_kg: '', activity_multiplier: '1.2' },
};

export function ClientListPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');

  const { data: clients = [], isLoading, error } = useClients();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClientId, setEditingClientId] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormState>(defaultForm);

  const createMutation = useCreateClient();
  const updateMutation = useUpdateClient(editingClientId || '');
  const deleteMutation = useDeleteClient();

  const handleOpenNew = () => {
    setEditingClientId(null);
    setFormData(defaultForm);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (client: Client) => {
    setEditingClientId(client.id);
    setFormData({
      status: client.status,
      personal_info: {
        first_name: client.personal_info.first_name,
        last_name: client.personal_info.last_name,
        email: client.personal_info.email,
        phone: client.personal_info.phone || '',
        dob: client.personal_info.dob ? client.personal_info.dob.slice(0, 10) : '',
        age: client.personal_info.age?.toString() || '',
        gender: client.personal_info.gender || '',
      },
      goals: (client.goals || []).join(', '),
      tags: (client.tags || []).join(', '),
      measurements: {
        height_cm: client.measurements?.height_cm?.toString() || '',
        weight_kg: client.measurements?.weight_kg?.toString() || '',
        activity_multiplier: client.measurements?.activity_multiplier?.toString() || '1.2',
      },
    });
    setIsModalOpen(true);
  };

  const handleDelete = (client: Client) => {
    if (window.confirm(`Are you sure you want to delete ${client.personal_info.first_name}?`)) {
      deleteMutation.mutate(client.id);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload: CreateClientInput = {
      status: formData.status,
      personal_info: {
        first_name: formData.personal_info.first_name,
        last_name: formData.personal_info.last_name,
        email: formData.personal_info.email,
        phone: formData.personal_info.phone || undefined,
        dob: formData.personal_info.dob || undefined,
        age: formData.personal_info.age ? parseInt(formData.personal_info.age) : undefined,
        gender: formData.personal_info.gender || undefined,
      },
      goals: formData.goals.split(',').map(g => g.trim()).filter(Boolean),
      tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
      measurements: {
        height_cm: formData.measurements.height_cm ? parseFloat(formData.measurements.height_cm) : undefined,
        weight_kg: formData.measurements.weight_kg ? parseFloat(formData.measurements.weight_kg) : undefined,
        activity_multiplier: formData.measurements.activity_multiplier ? parseFloat(formData.measurements.activity_multiplier) : undefined,
      },
    };
    if (editingClientId) {
      updateMutation.mutate(payload, {
        onSuccess: () => setIsModalOpen(false)
      });
    } else {
      createMutation.mutate(payload, {
        onSuccess: () => setIsModalOpen(false)
      });
    }
  };

  const filteredClients = clients.filter((client: Client) => {
    const q = search.toLowerCase().trim();
    const fullName = `${client.personal_info.first_name} ${client.personal_info.last_name}`.toLowerCase();
    const matchesSearch = !q ||
      fullName.includes(q) ||
      client.personal_info.email.toLowerCase().includes(q) ||
      (client.personal_info.phone?.replace(/\s/g, '').includes(q.replace(/\s/g, '')) ?? false);
    const matchesStatus = statusFilter === 'All' || client.status === statusFilter.toLowerCase();
    return matchesSearch && matchesStatus;
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
            </div>

            {/* Client Table */}
            <Card hover={false}>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-bg-elevated">
                      <th className="text-left text-xs font-display font-medium text-text-secondary px-5 py-3 rounded-l-md">Client</th>
                      <th className="text-left text-xs font-display font-medium text-text-secondary px-5 py-3">Goals</th>
                      <th className="text-left text-xs font-display font-medium text-text-secondary px-5 py-3">Weight</th>
                      <th className="text-left text-xs font-display font-medium text-text-secondary px-5 py-3">Height</th>
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
                            <Avatar name={`${client.personal_info.first_name} ${client.personal_info.last_name}`} size="md" active={client.status === 'active'} />
                            <div>
                              <p className="text-sm font-display font-medium text-text-primary">{client.personal_info.first_name} {client.personal_info.last_name}</p>
                              <p className="text-xs text-text-secondary">{client.personal_info.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          {client.goals && client.goals.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {client.goals.slice(0, 2).map((g: string) => (
                                <GoalBadge key={g} goal={g} />
                              ))}
                              {client.goals.length > 2 && (
                                <span className="text-xs text-text-muted">+{client.goals.length - 2}</span>
                              )}
                            </div>
                          ) : (
                            <span className="text-xs text-text-muted">None</span>
                          )}
                        </td>
                        <td className="px-5 py-4 text-sm text-text-secondary">
                          {client.measurements?.weight_kg ? `${client.measurements.weight_kg} kg` : '—'}
                        </td>
                        <td className="px-5 py-4 text-sm text-text-secondary">
                          {client.measurements?.height_cm ? `${client.measurements.height_cm} cm` : '—'}
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
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="First Name"
                    placeholder="Jane"
                    value={formData.personal_info.first_name}
                    onChange={e => setFormData({...formData, personal_info: {...formData.personal_info, first_name: e.target.value}})}
                    required
                  />
                  <Input
                    label="Last Name"
                    placeholder="Doe"
                    value={formData.personal_info.last_name}
                    onChange={e => setFormData({...formData, personal_info: {...formData.personal_info, last_name: e.target.value}})}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Email Address"
                    type="email"
                    placeholder="jane@example.com"
                    value={formData.personal_info.email}
                    onChange={e => setFormData({...formData, personal_info: {...formData.personal_info, email: e.target.value}})}
                    required
                  />
                  <Input
                    label="Phone Number"
                    placeholder="+1 234 567 8900"
                    value={formData.personal_info.phone}
                    onChange={e => setFormData({...formData, personal_info: {...formData.personal_info, phone: e.target.value}})}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Date of Birth"
                    type="date"
                    value={formData.personal_info.dob}
                    onChange={e => setFormData({...formData, personal_info: {...formData.personal_info, dob: e.target.value}})}
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      label="Age"
                      type="number"
                      placeholder="25"
                      value={formData.personal_info.age}
                      onChange={e => setFormData({...formData, personal_info: {...formData.personal_info, age: e.target.value}})}
                    />
                    <Input
                      label="Gender"
                      placeholder="Male"
                      value={formData.personal_info.gender}
                      onChange={e => setFormData({...formData, personal_info: {...formData.personal_info, gender: e.target.value}})}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-display font-semibold text-text-secondary uppercase mb-1.5">Health Goals</label>
                    <Input
                      placeholder="e.g. weight_loss"
                      value={formData.goals}
                      onChange={e => setFormData({...formData, goals: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-display font-semibold text-text-secondary uppercase mb-1.5">Tags</label>
                    <Input
                      placeholder="e.g. vip, new_client"
                      value={formData.tags}
                      onChange={e => setFormData({...formData, tags: e.target.value})}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <Input
                    label="Height (cm)"
                    type="number"
                    placeholder="175"
                    value={formData.measurements.height_cm}
                    onChange={e => setFormData({...formData, measurements: {...formData.measurements, height_cm: e.target.value}})}
                  />
                  <Input
                    label="Weight (kg)"
                    type="number"
                    placeholder="70"
                    value={formData.measurements.weight_kg}
                    onChange={e => setFormData({...formData, measurements: {...formData.measurements, weight_kg: e.target.value}})}
                  />
                  <Input
                    label="Activity Multiplier"
                    type="number"
                    step="0.1"
                    placeholder="1.2"
                    value={formData.measurements.activity_multiplier}
                    onChange={e => setFormData({...formData, measurements: {...formData.measurements, activity_multiplier: e.target.value}})}
                  />
                </div>

                <div>
                  <label className="block text-xs font-display font-semibold text-text-secondary uppercase mb-1.5">Status</label>
                  <select
                    value={formData.status}
                    onChange={e => setFormData({...formData, status: e.target.value as 'active' | 'inactive'})}
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

      {/* Floating Action Button */}
      <button
        onClick={handleOpenNew}
        className="fixed bottom-6 right-6 w-14 h-14 bg-brand-primary text-white rounded-full shadow-lg flex items-center justify-center hover:bg-brand-dim transition-colors z-40"
        title="Add Client"
      >
        <PlusCircle className="w-6 h-6" />
      </button>
    </>
  );
}
