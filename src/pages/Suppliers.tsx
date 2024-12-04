import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Users, Plus, Search } from 'lucide-react';
import { SupplierForm } from '../components/suppliers/SupplierForm';
import { SupplierTable } from '../components/suppliers/SupplierTable';
import { Button } from '../components/ui/Button';
import { Alert } from '../components/ui/Alert';
import { getSuppliers, addSupplier, updateSupplier, deleteSupplier } from '../lib/api/suppliers';
import { confirmDelete, showError } from '../lib/utils';
import type { Supplier } from '../lib/api/suppliers';

interface AlertState {
  message: string;
  type: 'success' | 'error';
}

export function Suppliers() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [alert, setAlert] = useState<AlertState | null>(null);

  const queryClient = useQueryClient();

  const { data: suppliers, isLoading } = useQuery({
    queryKey: ['suppliers'],
    queryFn: getSuppliers
  });

  const addMutation = useMutation({
    mutationFn: addSupplier,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
      setIsFormOpen(false);
      setAlert({
        message: 'Fournisseur ajouté avec succès',
        type: 'success'
      });
    },
    onError: () => {
      setAlert({
        message: 'Erreur lors de l\'ajout du fournisseur',
        type: 'error'
      });
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Supplier> }) => 
      updateSupplier(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
      setEditingSupplier(null);
      setAlert({
        message: 'Fournisseur mis à jour avec succès',
        type: 'success'
      });
    },
    onError: () => {
      setAlert({
        message: 'Erreur lors de la mise à jour du fournisseur',
        type: 'error'
      });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: deleteSupplier,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
      setAlert({
        message: 'Fournisseur supprimé avec succès',
        type: 'success'
      });
    },
    onError: () => {
      setAlert({
        message: 'Erreur lors de la suppression du fournisseur',
        type: 'error'
      });
    }
  });

  const filteredSuppliers = suppliers?.filter(
    (supplier) =>
      supplier.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      supplier.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      supplier.phone.includes(searchQuery)
  );

  const handleSubmit = async (data: Omit<Supplier, 'id'>) => {
    if (editingSupplier) {
      await updateMutation.mutate({ id: editingSupplier.id!, data });
    } else {
      await addMutation.mutate(data);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const confirmed = await confirmDelete(
        'Êtes-vous sûr ?',
        'Cette action est irréversible. Le fournisseur sera définitivement supprimé.'
      );
      
      if (confirmed) {
        await deleteMutation.mutateAsync(id);
      }
    } catch (error: any) {
      await showError(
        'Impossible de supprimer',
        error.message || 'Une erreur est survenue lors de la suppression'
      );
    }
  };

  return (
    <div className="space-y-6">
      {alert && (
        <Alert
          message={alert.message}
          type={alert.type}
          onClose={() => setAlert(null)}
        />
      )}

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Fournisseurs</h1>
          <p className="mt-2 text-sm text-gray-600">
            Gérez vos fournisseurs de clés et leurs informations
          </p>
        </div>
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-initial">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2 w-full sm:w-64 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-locimo-blue"
            />
          </div>
          <Button onClick={() => setIsFormOpen(true)} className="whitespace-nowrap">
            <Plus className="h-4 w-4 mr-2" />
            Ajouter un Fournisseur
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <SupplierTable
            suppliers={filteredSuppliers}
            isLoading={isLoading}
            onEdit={setEditingSupplier}
            onDelete={handleDelete}
          />
        </div>
      </div>

      {(isFormOpen || editingSupplier) && (
        <SupplierForm
          supplier={editingSupplier}
          onSubmit={handleSubmit}
          onClose={() => {
            setIsFormOpen(false);
            setEditingSupplier(null);
          }}
          isSubmitting={addMutation.isPending || updateMutation.isPending}
        />
      )}
    </div>
  );
}