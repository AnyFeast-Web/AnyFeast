import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PlusCircle, Search, Edit2, Check, X, Filter } from 'lucide-react';
import { TopBar } from '../../components/layout/TopBar';
import { PageWrapper } from '../../components/layout/PageWrapper';
import { Card, Button, Input, Badge } from '../../components/ui';
import { useIngredients, useCreateIngredient, useUpdateIngredient } from '../../hooks/useIngredients';
import { INGREDIENT_CATEGORIES, CATEGORY_LABELS } from '../../utils/constants';

interface IngredientRow {
  id: string;
  name: string;
  category: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
}

export function NutritionDBPage() {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  
  const { data: ingredients = [], isLoading, error } = useIngredients();
  const createIngredientMutation = useCreateIngredient();

  // Inline editing state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<IngredientRow>>({});

  // Add modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newIng, setNewIng] = useState<Partial<IngredientRow>>({
    name: '', category: 'vegetables', calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0
  });

  const filtered = ingredients.filter((ing: any) => {
    const matchSearch = ing.name.toLowerCase().includes(search.toLowerCase());
    const matchCat = categoryFilter === 'all' || ing.category === categoryFilter;
    return matchSearch && matchCat;
  });

  // Edit actions — use the hook at component level with the editing ID
  const updateIngredientMutation = useUpdateIngredient(editingId || '');

  const startEdit = (ing: IngredientRow) => {
    setEditingId(ing.id);
    setEditForm(ing);
  };

  const saveEdit = () => {
    if (!editingId || !editForm.name) return;
    updateIngredientMutation.mutate({
      name: editForm.name,
      category: editForm.category,
      calories: Number(editForm.calories) || 0,
      protein: Number(editForm.protein) || 0,
      carbs: Number(editForm.carbs) || 0,
      fat: Number(editForm.fat) || 0,
      fiber: Number(editForm.fiber) || 0,
    }, {
      onSuccess: () => {
        setEditingId(null);
        setEditForm({});
      }
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({});
  };

  // Add actions
  const handleAddNew = () => {
    if (!newIng.name) return;
    createIngredientMutation.mutate({
      name: newIng.name,
      category: newIng.category || 'other',
      calories: Number(newIng.calories) || 0,
      protein: Number(newIng.protein) || 0,
      carbs: Number(newIng.carbs) || 0,
      fat: Number(newIng.fat) || 0,
      fiber: Number(newIng.fiber) || 0,
    }, {
      onSuccess: () => {
        setIsModalOpen(false);
        setNewIng({ name: '', category: 'vegetables', calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 });
      }
    });
  };

  return (
    <>
      <TopBar 
        title="Ingredient Database" 
        subtitle="Manage food items and macronutrients"
        actions={
          <Button icon={<PlusCircle className="w-4 h-4" />} onClick={() => setIsModalOpen(true)}>
            Add Ingredient
          </Button>
        }
      />
      
      <PageWrapper>
        <Card>
          {/* Toolbar */}
          <div className="p-4 border-b border-border-subtle flex flex-col sm:flex-row gap-4 justify-between bg-bg-surface/50">
            <div className="w-full sm:w-96 flex bg-bg-input border border-border-subtle rounded-md overflow-hidden focus-within:border-brand-primary transition-colors">
              <div className="pl-3 flex items-center justify-center text-text-muted">
                <Search className="w-4 h-4" />
              </div>
              <input 
                type="text" 
                placeholder="Search ingredients..." 
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full bg-transparent px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none"
              />
            </div>
            
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-text-muted hidden sm:block" />
              <select 
                value={categoryFilter} 
                onChange={e => setCategoryFilter(e.target.value)}
                className="bg-bg-input border border-border-subtle rounded-md px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-brand-primary"
              >
                <option value="all">All Categories</option>
                {INGREDIENT_CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{CATEGORY_LABELS[cat]}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto min-h-[500px]">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-bg-surface/80 border-b border-border-subtle">
                  <th className="px-5 py-3 text-xs font-display font-semibold text-text-secondary uppercase tracking-wider">Ingredient</th>
                  <th className="px-5 py-3 text-xs font-display font-semibold text-text-secondary uppercase tracking-wider">Category</th>
                  <th className="px-5 py-3 text-xs font-display font-semibold text-text-secondary uppercase tracking-wider text-right">Calories</th>
                  <th className="px-5 py-3 text-xs font-display font-semibold text-macro-protein uppercase tracking-wider text-right">Protein (g)</th>
                  <th className="px-5 py-3 text-xs font-display font-semibold text-macro-carbs uppercase tracking-wider text-right">Carbs (g)</th>
                  <th className="px-5 py-3 text-xs font-display font-semibold text-macro-fat uppercase tracking-wider text-right">Fat (g)</th>
                  <th className="px-5 py-3 text-xs font-display font-semibold text-macro-fiber uppercase tracking-wider text-right">Fiber (g)</th>
                  <th className="px-5 py-3 text-xs font-display font-semibold text-text-secondary uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle">
                {isLoading && (
                  <tr>
                    <td colSpan={8} className="px-5 py-8 text-center text-text-muted">
                      <div className="flex justify-center mb-2">
                        <div className="w-6 h-6 border-4 border-brand-primary border-t-transparent rounded-full animate-spin" />
                      </div>
                      Loading ingredients...
                    </td>
                  </tr>
                )}
                {error && (
                  <tr>
                    <td colSpan={8} className="px-5 py-8 text-center text-accent-rose">
                      Failed to load ingredients.
                    </td>
                  </tr>
                )}
                {!isLoading && !error && filtered.map((ing: any) => {
                  const isEditing = editingId === ing.id;
                  
                  return (
                    <motion.tr 
                      key={ing.id}
                      layout
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className={`group hover:bg-bg-surface/50 transition-colors ${isEditing ? 'bg-brand-primary/5' : ''}`}
                    >
                      <td className="px-5 py-3">
                        {isEditing ? (
                          <input type="text" value={editForm.name || ''} onChange={e => setEditForm({...editForm, name: e.target.value})} className="w-full max-w-[150px] px-2 py-1 text-sm border border-border-strong rounded focus:outline-none focus:border-brand-primary" />
                        ) : (
                          <span className="text-sm font-medium text-text-primary">{ing.name}</span>
                        )}
                      </td>
                      <td className="px-5 py-3">
                        {isEditing ? (
                          <select value={editForm.category || ''} onChange={e => setEditForm({...editForm, category: e.target.value})} className="w-full max-w-[120px] px-2 py-1 text-sm border border-border-strong rounded focus:outline-none focus:border-brand-primary">
                            {INGREDIENT_CATEGORIES.map(cat => <option key={cat} value={cat}>{CATEGORY_LABELS[cat]}</option>)}
                          </select>
                        ) : (
                          <Badge variant="gray" size="sm" className="capitalize">{CATEGORY_LABELS[ing.category as keyof typeof CATEGORY_LABELS] || ing.category}</Badge>
                        )}
                      </td>
                      <td className="px-5 py-3 text-right">
                        {isEditing ? (
                          <input type="number" value={editForm.calories ?? ''} onChange={e => setEditForm({...editForm, calories: Number(e.target.value)})} className="w-16 px-2 py-1 text-sm border border-border-strong rounded text-right focus:outline-none focus:border-brand-primary" />
                        ) : (
                          <span className="text-sm text-text-secondary mono-number">{Math.round(Number(ing.calories) || 0)}</span>
                        )}
                      </td>
                      <td className="px-5 py-3 text-right">
                        {isEditing ? (
                          <input type="number" value={editForm.protein ?? ''} onChange={e => setEditForm({...editForm, protein: Number(e.target.value)})} className="w-16 px-2 py-1 text-sm border border-border-strong rounded text-right focus:outline-none focus:border-brand-primary" />
                        ) : (
                          <span className="text-sm text-text-secondary mono-number">{Number(ing.protein) || 0}</span>
                        )}
                      </td>
                      <td className="px-5 py-3 text-right">
                        {isEditing ? (
                          <input type="number" value={editForm.carbs ?? ''} onChange={e => setEditForm({...editForm, carbs: Number(e.target.value)})} className="w-16 px-2 py-1 text-sm border border-border-strong rounded text-right focus:outline-none focus:border-brand-primary" />
                        ) : (
                          <span className="text-sm text-text-secondary mono-number">{Number(ing.carbs) || 0}</span>
                        )}
                      </td>
                      <td className="px-5 py-3 text-right">
                        {isEditing ? (
                          <input type="number" value={editForm.fat ?? ''} onChange={e => setEditForm({...editForm, fat: Number(e.target.value)})} className="w-16 px-2 py-1 text-sm border border-border-strong rounded text-right focus:outline-none focus:border-brand-primary" />
                        ) : (
                          <span className="text-sm text-text-secondary mono-number">{Number(ing.fat) || 0}</span>
                        )}
                      </td>
                      <td className="px-5 py-3 text-right">
                        {isEditing ? (
                          <input type="number" value={editForm.fiber ?? ''} onChange={e => setEditForm({...editForm, fiber: Number(e.target.value)})} className="w-16 px-2 py-1 text-sm border border-border-strong rounded text-right focus:outline-none focus:border-brand-primary" />
                        ) : (
                          <span className="text-sm text-text-secondary mono-number">{Number(ing.fiber) || 0}</span>
                        )}
                      </td>
                      <td className="px-5 py-3 text-right">
                        {isEditing ? (
                          <div className="flex items-center justify-end gap-2">
                            <button onClick={saveEdit} disabled={updateIngredientMutation.isPending} className="p-1.5 bg-brand-primary/10 text-brand-primary rounded hover:bg-brand-primary/20 transition-colors" title="Save">
                              {updateIngredientMutation.isPending ? (
                                <div className="w-4 h-4 border-2 border-brand-primary border-t-transparent rounded-full animate-spin" />
                              ) : (
                                <Check className="w-4 h-4" />
                              )}
                            </button>
                            <button onClick={cancelEdit} className="p-1.5 bg-accent-rose/10 text-accent-rose rounded hover:bg-accent-rose/20 transition-colors" title="Cancel">
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <button 
                            onClick={() => startEdit(ing)}
                            className="p-1.5 text-text-muted hover:text-text-primary hover:bg-bg-elevated rounded transition-colors opacity-0 group-hover:opacity-100"
                            title="Edit"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                        )}
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
            
            {filtered.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16 text-text-muted">
                <Search className="w-8 h-8 mb-3 opacity-50" />
                <p>No ingredients found matching your search.</p>
              </div>
            )}
          </div>
        </Card>
      </PageWrapper>

      {/* Add New Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-bg-inverse/20 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }} 
              animate={{ opacity: 1, scale: 1 }} 
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-bg-surface border border-border-subtle rounded-xl p-6 w-full max-w-lg shadow-xl"
            >
              <h3 className="text-lg font-display font-semibold text-text-primary mb-4">Add New Ingredient</h3>
              
              <div className="space-y-4">
                <Input label="Ingredient Name" placeholder="e.g. Avocado (Raw)" value={newIng.name} onChange={e => setNewIng({...newIng, name: e.target.value})} autoFocus />
                
                <div>
                  <label className="block text-xs font-display font-semibold text-text-secondary uppercase mb-1.5">Category</label>
                  <select 
                    value={newIng.category} 
                    onChange={e => setNewIng({...newIng, category: e.target.value})}
                    className="w-full bg-bg-input border border-border-subtle rounded-md px-3.5 py-2.5 text-sm text-text-primary focus:outline-none focus:border-brand-primary"
                  >
                    {INGREDIENT_CATEGORIES.map(cat => <option key={cat} value={cat}>{CATEGORY_LABELS[cat]}</option>)}
                  </select>
                </div>

                <div className="pt-2 border-t border-border-subtle">
                  <h4 className="text-sm font-medium text-text-primary mb-3">Macros per 100g</h4>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                    <Input label="Cal" type="number" value={newIng.calories || ''} onChange={e => setNewIng({...newIng, calories: Number(e.target.value)})} />
                    <Input label="Pro (g)" type="number" value={newIng.protein || ''} onChange={e => setNewIng({...newIng, protein: Number(e.target.value)})} />
                    <Input label="Carbs (g)" type="number" value={newIng.carbs || ''} onChange={e => setNewIng({...newIng, carbs: Number(e.target.value)})} />
                    <Input label="Fat (g)" type="number" value={newIng.fat || ''} onChange={e => setNewIng({...newIng, fat: Number(e.target.value)})} />
                    <Input label="Fiber (g)" type="number" value={newIng.fiber || ''} onChange={e => setNewIng({...newIng, fiber: Number(e.target.value)})} />
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-8">
                <Button variant="secondary" className="flex-1" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                <Button className="flex-1" onClick={handleAddNew} disabled={!newIng.name || createIngredientMutation.isPending}>
                  {createIngredientMutation.isPending ? 'Adding...' : 'Add to Database'}
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
