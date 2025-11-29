import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Edit, Trash2, Search } from 'lucide-react';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Workers = () => {
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingWorker, setEditingWorker] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    worker_id: '',
    daily_wage_rate: '',
  });

  useEffect(() => {
    fetchWorkers();
  }, []);

  const fetchWorkers = async () => {
    try {
      const response = await axios.get(`${API}/workers`);
      setWorkers(response.data);
    } catch (error) {
      console.error('Error fetching workers:', error);
      toast.error('Failed to load workers');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingWorker) {
        await axios.put(`${API}/workers/${editingWorker.id}`, formData);
        toast.success('Worker updated successfully');
      } else {
        await axios.post(`${API}/workers`, formData);
        toast.success('Worker added successfully');
      }
      fetchWorkers();
      handleCloseDialog();
    } catch (error) {
      console.error('Error saving worker:', error);
      toast.error(error.response?.data?.detail || 'Failed to save worker');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this worker?')) return;
    try {
      await axios.delete(`${API}/workers/${id}`);
      toast.success('Worker deleted successfully');
      fetchWorkers();
    } catch (error) {
      console.error('Error deleting worker:', error);
      toast.error('Failed to delete worker');
    }
  };

  const handleEdit = (worker) => {
    setEditingWorker(worker);
    setFormData({
      name: worker.name,
      worker_id: worker.worker_id,
      daily_wage_rate: worker.daily_wage_rate,
    });
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingWorker(null);
    setFormData({ name: '', worker_id: '', daily_wage_rate: '' });
  };

  const filteredWorkers = workers.filter(
    (worker) =>
      worker.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      worker.worker_id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="heading-font text-4xl font-black text-zinc-900 mb-2">WORKERS</h1>
        <p className="body-font text-zinc-600">Manage your workforce</p>
      </div>

      <div className="bg-white border border-zinc-200 rounded-sm p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={20} />
            <Input
              data-testid="search-workers"
              type="text"
              placeholder="Search by name or ID"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 rounded-sm border-zinc-300"
            />
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button
                data-testid="add-worker-button"
                onClick={() => handleCloseDialog()}
                className="bg-primary hover:bg-primary/90 text-white rounded-sm industrial-shadow btn-industrial uppercase tracking-wide"
              >
                <Plus size={20} className="mr-2" />
                Add Worker
              </Button>
            </DialogTrigger>
            <DialogContent className="rounded-sm">
              <DialogHeader>
                <DialogTitle className="heading-font text-2xl font-bold uppercase">
                  {editingWorker ? 'Edit Worker' : 'Add New Worker'}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                <div>
                  <Label htmlFor="name" className="body-font text-sm font-medium uppercase tracking-wide">
                    Name
                  </Label>
                  <Input
                    data-testid="worker-name-input"
                    id="name"
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="mt-1 rounded-sm border-zinc-300"
                  />
                </div>
                <div>
                  <Label htmlFor="worker_id" className="body-font text-sm font-medium uppercase tracking-wide">
                    Worker ID
                  </Label>
                  <Input
                    data-testid="worker-id-input"
                    id="worker_id"
                    type="text"
                    required
                    value={formData.worker_id}
                    onChange={(e) => setFormData({ ...formData, worker_id: e.target.value })}
                    className="mt-1 rounded-sm border-zinc-300"
                    disabled={!!editingWorker}
                  />
                </div>
                <div>
                  <Label htmlFor="daily_wage_rate" className="body-font text-sm font-medium uppercase tracking-wide">
                    Daily Wage Rate (₹)
                  </Label>
                  <Input
                    data-testid="worker-wage-input"
                    id="daily_wage_rate"
                    type="number"
                    step="0.01"
                    required
                    value={formData.daily_wage_rate}
                    onChange={(e) => setFormData({ ...formData, daily_wage_rate: e.target.value })}
                    className="mt-1 rounded-sm border-zinc-300 mono-font"
                  />
                </div>
                <div className="flex gap-3 pt-4">
                  <Button
                    data-testid="submit-worker-button"
                    type="submit"
                    className="flex-1 bg-primary hover:bg-primary/90 text-white rounded-sm industrial-shadow btn-industrial uppercase tracking-wide"
                  >
                    {editingWorker ? 'Update' : 'Add'} Worker
                  </Button>
                  <Button
                    type="button"
                    onClick={handleCloseDialog}
                    variant="outline"
                    className="rounded-sm uppercase tracking-wide"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {loading ? (
          <div className="animate-pulse space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-zinc-100 rounded"></div>
            ))}
          </div>
        ) : filteredWorkers.length === 0 ? (
          <div className="text-center py-12">
            <p className="body-font text-zinc-500">No workers found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-zinc-900">
                  <th className="body-font text-left py-3 px-4 font-bold uppercase tracking-wide text-sm">Name</th>
                  <th className="body-font text-left py-3 px-4 font-bold uppercase tracking-wide text-sm">Worker ID</th>
                  <th className="body-font text-left py-3 px-4 font-bold uppercase tracking-wide text-sm">Daily Wage</th>
                  <th className="body-font text-right py-3 px-4 font-bold uppercase tracking-wide text-sm">Actions</th>
                </tr>
              </thead>
              <tbody className="table-zebra">
                {filteredWorkers.map((worker) => (
                  <tr key={worker.id} className="border-b border-zinc-200" data-testid="worker-row">
                    <td className="body-font py-4 px-4">{worker.name}</td>
                    <td className="body-font py-4 px-4 mono-font">{worker.worker_id}</td>
                    <td className="body-font py-4 px-4 mono-font">₹{worker.daily_wage_rate.toFixed(2)}</td>
                    <td className="py-4 px-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          data-testid={`edit-worker-${worker.id}`}
                          onClick={() => handleEdit(worker)}
                          className="p-2 hover:bg-zinc-100 rounded-sm transition-colors"
                        >
                          <Edit size={18} className="text-zinc-600" />
                        </button>
                        <button
                          data-testid={`delete-worker-${worker.id}`}
                          onClick={() => handleDelete(worker.id)}
                          className="p-2 hover:bg-red-50 rounded-sm transition-colors"
                        >
                          <Trash2 size={18} className="text-red-600" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Workers;