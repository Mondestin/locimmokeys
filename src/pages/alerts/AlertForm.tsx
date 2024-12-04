import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Alert } from '../../components/ui/Alert';
import { getAlert, addAlert, updateAlert } from '../../lib/api/alerts';
import { getKeys } from '../../lib/api/keys';
import type { Alert as AlertType } from '../../lib/api/alerts';
import { useState } from 'react';

interface AlertState {
  message: string;
  type: 'success' | 'error';
}

export function AlertForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [alert, setAlert] = useState<AlertState | null>(null);
  const queryClient = useQueryClient();

  const { data: alertData } = useQuery({
    queryKey: ['alerts', id],
    queryFn: () => getAlert(id!),
    enabled: !!id
  });

  const { data: keys } = useQuery({
    queryKey: ['keys'],
    queryFn: getKeys
  });

  const { register, handleSubmit, formState: { errors }, reset } = useForm<AlertType>({
    defaultValues: {
      key_id: alertData?.key_id || '',
      alert_date: alertData?.alert_date || new Date().toISOString().split('T')[0],
      description: alertData?.description || '',
      status: alertData?.status || 'Pending',
    },
  });

  useEffect(() => {
    if (alertData) {
      reset(alertData);
    }
  }, [alertData, reset]);

  const mutation = useMutation({
    mutationFn: (data: Omit<AlertType, 'id'>) => {
      if (id) {
        return updateAlert(id, data);
      }
      return addAlert(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alerts'] });
      navigate('/alerts');
      setAlert({
        message: `Alerte ${id ? 'modifiée' : 'ajoutée'} avec succès`,
        type: 'success'
      });
    },
    onError: () => {
      setAlert({
        message: `Erreur lors de ${id ? 'la modification' : 'l\'ajout'} de l'alerte`,
        type: 'error'
      });
    }
  });

  return (
    <div className="space-y-6">
      {alert && (
        <Alert
          message={alert.message}
          type={alert.type}
          onClose={() => setAlert(null)}
        />
      )}

      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          onClick={() => navigate('/alerts')}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour
        </Button>
        <h1 className="text-2xl font-bold text-gray-900">
          {id ? 'Modifier l\'Alerte' : 'Ajouter une Alerte'}
        </h1>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <form onSubmit={handleSubmit(mutation.mutate)} className="p-6 space-y-6">
          <div>
            <label
              htmlFor="key_id"
              className="block text-sm font-medium text-gray-700"
            >
              Clé <span className="text-red-500">*</span>
            </label>
            <select
              id="key_id"
              {...register('key_id', { required: 'La clé est requise' })}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-locimo-blue focus:outline-none focus:ring-1 focus:ring-locimo-blue"
            >
              <option value="">Sélectionner une clé</option>
              {keys?.map((key) => (
                <option key={key.id} value={key.id}>
                  {key.description} - {key.supplier_name}
                </option>
              ))}
            </select>
            {errors.key_id && (
              <p className="mt-1 text-sm text-red-600">
                {errors.key_id.message}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="alert_date"
              className="block text-sm font-medium text-gray-700"
            >
              Date d'Alerte <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              id="alert_date"
              {...register('alert_date', { required: 'La date est requise' })}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-locimo-blue focus:outline-none focus:ring-1 focus:ring-locimo-blue"
            />
            {errors.alert_date && (
              <p className="mt-1 text-sm text-red-600">
                {errors.alert_date.message}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium text-gray-700"
            >
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              id="description"
              rows={3}
              {...register('description', { required: 'La description est requise' })}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-locimo-blue focus:outline-none focus:ring-1 focus:ring-locimo-blue"
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-600">
                {errors.description.message}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="status"
              className="block text-sm font-medium text-gray-700"
            >
              Statut <span className="text-red-500">*</span>
            </label>
            <select
              id="status"
              {...register('status', { required: 'Le statut est requis' })}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-locimo-blue focus:outline-none focus:ring-1 focus:ring-locimo-blue"
            >
              <option value="Pending">En attente</option>
              <option value="Dismissed">Ignorée</option>
            </select>
            {errors.status && (
              <p className="mt-1 text-sm text-red-600">
                {errors.status.message}
              </p>
            )}
          </div>

          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/alerts')}
            >
              Annuler
            </Button>
            <Button
              type="submit"
              disabled={mutation.isPending}
            >
              {mutation.isPending ? 'Enregistrement...' : id ? 'Modifier' : 'Ajouter'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}