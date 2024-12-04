import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AlertTriangle, Plus, Search } from 'lucide-react';
import { AlertTable } from '../../components/alerts/AlertTable';
import { Button } from '../../components/ui/Button';
import { Alert } from '../../components/ui/Alert';
import { getAlerts, deleteAlert } from '../../lib/api/alerts';
import { confirmDelete, showError } from '../../lib/utils';
import type { Alert as AlertType } from '../../lib/api/alerts';

interface AlertState {
  message: string;
  type: 'success' | 'error';
}

export function Alerts() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [alert, setAlert] = useState<AlertState | null>(null);

  const queryClient = useQueryClient();

  const { data: alerts, isLoading } = useQuery({
    queryKey: ['alerts'],
    queryFn: getAlerts
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
    onError: (error: any) => {
      setAlert({
        message: error.message || 'Erreur lors de la suppression de l\'alerte',
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

  const filteredAlerts = sortedAlerts?.filter(alert =>
    alert.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleEdit = (alert: AlertType) => {
    navigate(`/alerts/${alert.id}/edit`);
  };

  const handleDelete = async (id: string) => {
    try {
      const confirmed = await confirmDelete(
        'Êtes-vous sûr ?',
        'Cette action est irréversible. L\'alerte sera définitivement supprimée.'
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
          <h1 className="text-2xl font-bold text-gray-900">Alertes</h1>
          <p className="mt-2 text-sm text-gray-600">
            Gérez les alertes pour vos clés
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
          <Button onClick={() => navigate('/alerts/new')} className="whitespace-nowrap">
            <Plus className="h-4 w-4 mr-2" />
            Ajouter une Alerte
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <AlertTable
            alerts={filteredAlerts}
            isLoading={isLoading}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </div>
      </div>
    </div>
  );
}