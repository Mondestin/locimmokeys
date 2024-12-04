import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Building2, Plus, Search } from 'lucide-react';
import { PropertyTable } from '../../components/properties/PropertyTable';
import { Button } from '../../components/ui/Button';
import { Alert } from '../../components/ui/Alert';
import { getProperties, deleteProperty } from '../../lib/api/properties';
import { confirmDelete, showError } from '../../lib/utils';
import type { Property } from '../../lib/api/properties';

interface AlertState {
  message: string;
  type: 'success' | 'error';
}

export function Properties() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [alert, setAlert] = useState<AlertState | null>(null);

  const queryClient = useQueryClient();

  const { data: properties, isLoading } = useQuery({
    queryKey: ['properties'],
    queryFn: getProperties
  });

  const deleteMutation = useMutation({
    mutationFn: deleteProperty,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['properties'] });
      setAlert({
        message: 'Propriété supprimée avec succès',
        type: 'success'
      });
    },
    onError: (error: any) => {
      setAlert({
        message: error.message || 'Erreur lors de la suppression de la propriété',
        type: 'error'
      });
    }
  });

  const filteredProperties = properties?.filter(
    (property) =>
      property.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      property.owner_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleEdit = (property: Property) => {
    navigate(`/properties/${property.id}/edit`);
  };

  const handleDelete = async (id: string) => {
    try {
      const confirmed = await confirmDelete(
        'Êtes-vous sûr ?',
        'Cette action est irréversible. La propriété sera définitivement supprimée.'
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
          <h1 className="text-2xl font-bold text-gray-900">Propriétés</h1>
          <p className="mt-2 text-sm text-gray-600">
            Gérez vos propriétés et leurs clés associées
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
          <Button onClick={() => navigate('/properties/new')} className="whitespace-nowrap">
            <Plus className="h-4 w-4 mr-2" />
            Ajouter une Propriété
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <PropertyTable
            properties={filteredProperties}
            isLoading={isLoading}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </div>
      </div>
    </div>
  );
}