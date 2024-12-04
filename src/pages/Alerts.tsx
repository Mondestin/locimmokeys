import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AlertTriangle, Plus } from 'lucide-react';
import { AlertForm } from '../components/alerts/AlertForm';
import { AlertTable } from '../components/alerts/AlertTable';
import { Button } from '../components/ui/Button';
import { Alert } from '../components/ui/Alert';
import { getAlerts, addAlert, updateAlert, deleteAlert } from '../lib/api/alerts';
import { confirmDelete } from '../lib/utils';
import type { Alert as AlertType } from '../lib/api/alerts';

interface AlertState {
  message: string;
  type: 'success' | 'error';
}

export function Alerts() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingAlert, setEditingAlert] = useState<AlertType | null>(null);
  const [alert, setAlert] = useState<AlertState | null>(null);

  const queryClient = useQueryClient();

  const { data: alerts, isLoading } = useQuery({
    queryKey: ['alerts'],
    queryFn: getAlerts
  });

  const addMutation = useMutation({
    mutationFn: addAlert,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alerts'] });
      setIsFormOpen(false);
      setAlert({
        message: 'Alerte ajoutée avec succès',
        type: 'success'
      });
    },
    onError: () => {
      setAlert({
        message: 'Erreur lors de l\'ajout de l\'alerte',
        type: 'error'
      });
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<AlertType> }) => 
      updateAlert(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alerts'] });
      setEditingAlert(null);
      setAlert({
        message: 'Alerte mise à jour avec succès',
        type: 'success'
      });
    },
    onError: () => {
      setAlert({
        message: 'Erreur lors de la mise à jour de l\'alerte',
        type: 'error'
      });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: deleteAlert,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alerts'] });
      setAlert({
        message: 'Alerte supprimée avec succès',
        type: 'success'
      });
    },
    onError: () => {
      setAlert({
        message: 'Erreur lors de la suppression de l\'alerte',
        type: 'error'
      });
    }
  });

  // Sort alerts to show pending first
  const sortedAlerts = alerts?.sort((a, b) => {
    if (a.status === 'Pending' && b.status !== 'Pending') return -1;
    if (a.status !== 'Pending' && b.status === 'Pending') return 1;
    return new Date(b.alert_date).getTime() - new Date(a.alert_date).getTime();
  });

  const handleSubmit = async (data: Omit<AlertType, 'id'>) => {
    if (editingAlert) {
      await updateMutation.mutate({ id: editingAlert.id!, data });
    } else {
      await addMutation.mutate(data);
    }
  };

  const handleDelete = async (id: string) => {
    const confirmed = await confirmDelete(
      'Êtes-vous sûr ?',
      'Cette action est irréversible. L\'alerte sera définitivement supprimée.'
    );
    
    if (confirmed) {
      await deleteMutation.mutate(id);
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
          <h1 className="text-2xl font-bold text-gray-900">Alertes</h1>
          <p className="mt-2 text-sm text-gray-600">
            Gérez les alertes pour vos clés
          </p>
        </div>
        <Button onClick={() => setIsFormOpen(true)} className="whitespace-nowrap">
          <Plus className="h-4 w-4 mr-2" />
          Ajouter une Alerte
        </Button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <AlertTable
            alerts={sortedAlerts}
            isLoading={isLoading}
            onEdit={setEditingAlert}
            onDelete={handleDelete}
          />
        </div>
      </div>

      {(isFormOpen || editingAlert) && (
        <AlertForm
          alert={editingAlert}
          onSubmit={handleSubmit}
          onClose={() => {
            setIsFormOpen(false);
            setEditingAlert(null);
          }}
          isSubmitting={addMutation.isPending || updateMutation.isPending}
        />
      )}
    </div>
  );
}