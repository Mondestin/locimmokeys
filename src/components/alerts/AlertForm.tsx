import { useForm } from 'react-hook-form';
import { X } from 'lucide-react';
import { Button } from '../ui/Button';
import { useQuery } from '@tanstack/react-query';
import { getKeys } from '../../lib/api/keys';
import type { Alert } from '../../lib/api/alerts';

interface AlertFormProps {
  alert?: Alert | null;
  onClose: () => void;
  onSubmit: (data: Omit<Alert, 'id'>) => Promise<void>;
  isSubmitting: boolean;
}

export function AlertForm({ alert, onClose, onSubmit, isSubmitting }: AlertFormProps) {
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      key_id: alert?.key_id || '',
      alert_date: alert?.alert_date || '',
      description: alert?.description || '',
      status: alert?.status || 'Pending',
    },
  });

  const { data: keys } = useQuery({
    queryKey: ['keys'],
    queryFn: getKeys
  });

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {alert ? 'Modifier l\'Alerte' : 'Ajouter une Alerte'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
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
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="">Sélectionner une clé</option>
              {keys?.map((key) => (
                <option key={key.id} value={key.id}>
                  {key.property_id} - {key.supplier_name}
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
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
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
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
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
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
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

          <div className="flex justify-end gap-3 mt-6">
            <Button type="button" variant="outline" onClick={onClose}>
              Annuler
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Enregistrement...' : alert ? 'Modifier' : 'Ajouter'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}