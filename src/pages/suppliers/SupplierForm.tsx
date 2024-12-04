import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Alert } from '../../components/ui/Alert';
import { getSupplier, addSupplier, updateSupplier } from '../../lib/api/suppliers';
import type { Supplier } from '../../lib/api/suppliers';
import { useState } from 'react';

interface AlertState {
  message: string;
  type: 'success' | 'error';
}

export function SupplierForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [alert, setAlert] = useState<AlertState | null>(null);
  const queryClient = useQueryClient();

  const { data: supplier } = useQuery({
    queryKey: ['suppliers', id],
    queryFn: () => getSupplier(id!),
    enabled: !!id
  });

  const { register, handleSubmit, formState: { errors }, reset } = useForm<Supplier>({
    defaultValues: {
      name: supplier?.name || '',
      email: supplier?.email || '',
      phone: supplier?.phone || '',
    },
  });

  useEffect(() => {
    if (supplier) {
      reset(supplier);
    }
  }, [supplier, reset]);

  const mutation = useMutation({
    mutationFn: (data: Omit<Supplier, 'id'>) => {
      if (id) {
        return updateSupplier(id, data);
      }
      return addSupplier(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
      navigate('/suppliers');
      setAlert({
        message: `Fournisseur ${id ? 'modifié' : 'ajouté'} avec succès`,
        type: 'success'
      });
    },
    onError: () => {
      setAlert({
        message: `Erreur lors de ${id ? 'la modification' : 'l\'ajout'} du fournisseur`,
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
          onClick={() => navigate('/suppliers')}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour
        </Button>
        <h1 className="text-2xl font-bold text-gray-900">
          {id ? 'Modifier le Fournisseur' : 'Ajouter un Fournisseur'}
        </h1>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <form onSubmit={handleSubmit(mutation.mutate)} className="p-6 space-y-6">
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700"
            >
              Nom <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="name"
              {...register('name', { required: 'Le nom est requis' })}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-locimo-blue focus:outline-none focus:ring-1 focus:ring-locimo-blue"
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">
                {errors.name.message}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700"
            >
              Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              id="email"
              {...register('email', {
                required: 'L\'email est requis',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Adresse email invalide',
                },
              })}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-locimo-blue focus:outline-none focus:ring-1 focus:ring-locimo-blue"
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-600">
                {errors.email.message}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="phone"
              className="block text-sm font-medium text-gray-700"
            >
              Téléphone <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              id="phone"
              {...register('phone', {
                required: 'Le téléphone est requis',
                pattern: {
                  value: /^(?:(?:\+|00)33|0)\s*[1-9](?:[\s.-]*\d{2}){4}$/,
                  message: 'Numéro de téléphone invalide',
                },
              })}
              placeholder="06 12 34 56 78"
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-locimo-blue focus:outline-none focus:ring-1 focus:ring-locimo-blue"
            />
            {errors.phone && (
              <p className="mt-1 text-sm text-red-600">
                {errors.phone.message}
              </p>
            )}
          </div>

          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/suppliers')}
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