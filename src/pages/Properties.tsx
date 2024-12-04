import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Building2, Plus, Search } from 'lucide-react';
import { PropertyForm } from '../components/properties/PropertyForm';
import { PropertyTable } from '../components/properties/PropertyTable';
import { Button } from '../components/ui/Button';
import { Alert } from '../components/ui/Alert';
import { getProperties, addProperty, updateProperty, deleteProperty } from '../lib/api/properties';
import { seedDatabase } from '../lib/seedDatabase';
import { useAuth } from '../lib/auth';
import { confirmDelete, showError } from '../lib/utils';
import type { Property } from '../lib/api/properties';

interface AlertState {
  message: string;
  type: 'success' | 'error';
}

export function Properties() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [seeding, setSeeding] = useState(false);
  const [alert, setAlert] = useState<AlertState | null>(null);
  const { user } = useAuth();

  const queryClient = useQueryClient();

  const { data: properties, isLoading } = useQuery({
    queryKey: ['properties'],
    queryFn: getProperties,
    enabled: !!user
  });

  const addMutation = useMutation({
    mutationFn: addProperty,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['properties'] });
      setIsFormOpen(false);
      setAlert({
        message: 'Propriété ajoutée avec succès',
        type: 'success'
      });
    },
    onError: () => {
      setAlert({
        message: 'Erreur lors de l\'ajout de la propriété',
        type: 'error'
      });
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => updateProperty(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['properties'] });
      setEditingProperty(null);
      setAlert({
        message: 'Propriété mise à jour avec succès',
        type: 'success'
      });
    },
    onError: () => {
      setAlert({
        message: 'Erreur lors de la mise à jour de la propriété',
        type: 'error'
      });
    }
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
    onError: () => {
      setAlert({
        message: 'Erreur lors de la suppression de la propriété',
        type: 'error'
      });
    }
  });

  const filteredProperties = properties?.filter(
    (property) =>
      property.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      property.owner_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSubmit = async (data: Omit<Property, 'id'>) => {
    if (editingProperty) {
      await updateMutation.mutate({ id: editingProperty.id!, data });
    } else {
      await addMutation.mutate(data);
    }
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

  const handleSeedData = async () => {
    try {
      setSeeding(true);
      await seedDatabase();
      await queryClient.invalidateQueries({ queryKey: ['properties'] });
      setAlert({
        message: 'Données exemple ajoutées avec succès !',
        type: 'success'
      });
    } catch (error) {
      setAlert({
        message: 'Erreur lors de l\'ajout des données exemple',
        type: 'error'
      });
    } finally {
      setSeeding(false);
    }
  };

  if (!user) {
    return null;
  }

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
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          {(!properties?.length || properties.length === 0) && (
            <Button 
              onClick={handleSeedData} 
              variant="outline"
              disabled={seeding}
              className="whitespace-nowrap"
            >
              {seeding ? 'Ajout en cours...' : 'Ajouter des données exemple'}
            </Button>
          )}
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
            Ajouter une Propriété
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <PropertyTable
            properties={filteredProperties}
            isLoading={isLoading}
            onEdit={setEditingProperty}
            onDelete={handleDelete}
          />
        </div>
      </div>

      {(isFormOpen || editingProperty) && (
        <PropertyForm
          property={editingProperty}
          onSubmit={handleSubmit}
          onClose={() => {
            setIsFormOpen(false);
            setEditingProperty(null);
          }}
          isSubmitting={addMutation.isPending || updateMutation.isPending}
        />
      )}
    </div>
  );
}