import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Key as KeyIcon, Plus, Search } from 'lucide-react';
import { KeyForm } from '../components/keys/KeyForm';
import { KeyTable } from '../components/keys/KeyTable';
import { Button } from '../components/ui/Button';
import { Alert } from '../components/ui/Alert';
import { getKeys, addKey, updateKey, deleteKey } from '../lib/api/keys';
import { confirmDelete, showError } from '../lib/utils';
import type { Key } from '../lib/api/keys';

interface AlertState {
  message: string;
  type: 'success' | 'error';
}

export function Keys() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingKey, setEditingKey] = useState<Key | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [alert, setAlert] = useState<AlertState | null>(null);
  const itemsPerPage = 10;

  const queryClient = useQueryClient();

  const { data: keys, isLoading } = useQuery({
    queryKey: ['keys'],
    queryFn: getKeys
  });

  const addMutation = useMutation({
    mutationFn: addKey,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['keys'] });
      setIsFormOpen(false);
      setAlert({
        message: 'Clé ajoutée avec succès',
        type: 'success'
      });
    },
    onError: () => {
      setAlert({
        message: 'Erreur lors de l\'ajout de la clé',
        type: 'error'
      });
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => updateKey(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['keys'] });
      setEditingKey(null);
      setAlert({
        message: 'Clé mise à jour avec succès',
        type: 'success'
      });
    },
    onError: () => {
      setAlert({
        message: 'Erreur lors de la mise à jour de la clé',
        type: 'error'
      });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: deleteKey,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['keys'] });
      setAlert({
        message: 'Clé supprimée avec succès',
        type: 'success'
      });
    },
    onError: () => {
      setAlert({
        message: 'Erreur lors de la suppression de la clé',
        type: 'error'
      });
    }
  });

  const filteredKeys = keys?.filter((key) => {
    const searchLower = searchQuery.toLowerCase();
    return (
      (key.description || '').toLowerCase().includes(searchLower) ||
      (key.property_id || '').toLowerCase().includes(searchLower) ||
      (key.supplier_name || '').toLowerCase().includes(searchLower)
    );
  });

  const totalPages = Math.ceil((filteredKeys?.length || 0) / itemsPerPage);
  const paginatedKeys = filteredKeys?.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleSubmit = async (data: Omit<Key, 'id'>) => {
    if (editingKey) {
      await updateMutation.mutate({ id: editingKey.id!, data });
    } else {
      await addMutation.mutate(data);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const confirmed = await confirmDelete(
        'Êtes-vous sûr ?',
        'Cette action est irréversible. La clé sera définitivement supprimée.'
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
          <h1 className="text-2xl font-bold text-gray-900">Clés</h1>
          <p className="mt-2 text-sm text-gray-600">
            Gérez et suivez toutes les clés des propriétés
          </p>
        </div>
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-initial">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-9 pr-4 py-2 w-full sm:w-64 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-locimo-blue"
            />
          </div>
          <Button onClick={() => setIsFormOpen(true)} className="whitespace-nowrap">
            <Plus className="h-4 w-4 mr-2" />
            Ajouter une Clé
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <KeyTable
            keys={paginatedKeys}
            isLoading={isLoading}
            onEdit={setEditingKey}
            onDelete={handleDelete}
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      </div>

      {(isFormOpen || editingKey) && (
        <KeyForm
          keyData={editingKey}
          onSubmit={handleSubmit}
          onClose={() => {
            setIsFormOpen(false);
            setEditingKey(null);
          }}
          isSubmitting={addMutation.isPending || updateMutation.isPending}
        />
      )}
    </div>
  );
}