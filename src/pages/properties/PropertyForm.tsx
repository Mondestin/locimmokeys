import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Alert } from '../../components/ui/Alert';
import { getProperty, addProperty, updateProperty } from '../../lib/api/properties';
import type { Property } from '../../lib/api/properties';
import { useState } from 'react';

interface AlertState {
  message: string;
  type: 'success' | 'error';
}

export function PropertyForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [alert, setAlert] = useState<AlertState | null>(null);
  const queryClient = useQueryClient();

  const { data: property } = useQuery({
    queryKey: ['properties', id],
    queryFn: () => getProperty(id!),
    enabled: !!id
  });

  const { register, handleSubmit, formState: { errors }, reset } = useForm<Property>({
    defaultValues: {
      address: property?.address || '',
      owner_name: property?.owner_name || '',
    },
  });

  useEffect(() => {
    if (property) {
      reset(property);
    }
  }, [property, reset]);

  const mutation = useMutation({
    mutationFn: (data: Omit<Property, 'id'>) => {
      if (id) {
        return updateProperty(id, data);
      }
      return addProperty(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['properties'] });
      navigate('/properties');
      setAlert({
        message: `Propriété ${id ? 'modifiée' : 'ajoutée'} avec succès`,
        type: 'success'
      });
    },
    onError: () => {
      setAlert({
        message: `Erreur lors de ${id ? 'la modification' : 'l\'ajout'} de la propriété`,
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
          onClick={() => navigate('/properties')}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour
        </Button>
        <h1 className="text-2xl font-bold text-gray-900">
          {id ? 'Modifier la Propriété' : 'Ajouter une Propriété'}
        </h1>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <form onSubmit={handleSubmit(mutation.mutate)} className="p-6 space-y-6">
          <div>
            <label
              htmlFor="address"
              className="block text-sm font-medium text-gray-700"
            >
              Adresse <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="address"
              {...register('address', { required: 'L\'adresse est requise' })}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-locimo-blue focus:outline-none focus:ring-1 focus:ring-locimo-blue"
            />
            {errors.address && (
              <p className="mt-1 text-sm text-red-600">
                {errors.address.message}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="owner_name"
              className="block text-sm font-medium text-gray-700"
            >
              Propriétaire <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="owner_name"
              {...register('owner_name', { required: 'Le nom du propriétaire est requis' })}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-locimo-blue focus:outline-none focus:ring-1 focus:ring-locimo-blue"
            />
            {errors.owner_name && (
              <p className="mt-1 text-sm text-red-600">
                {errors.owner_name.message}
              </p>
            )}
          </div>

          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/properties')}
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