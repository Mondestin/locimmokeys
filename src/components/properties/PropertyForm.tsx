import { useForm } from 'react-hook-form';
import { X } from 'lucide-react';
import { Button } from '../ui/Button';

interface Property {
  id?: string;
  address: string;
  owner_name: string;
}

interface PropertyFormProps {
  property?: Property | null;
  onClose: () => void;
  onSubmit: (data: Omit<Property, 'id'>) => Promise<void>;
  isSubmitting: boolean;
}

export function PropertyForm({ property, onClose, onSubmit, isSubmitting }: PropertyFormProps) {
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      address: property?.address || '',
      owner_name: property?.owner_name || '',
    },
  });

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {property ? 'Modifier la Propriété' : 'Ajouter une Propriété'}
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
              htmlFor="address"
              className="block text-sm font-medium text-gray-700"
            >
              Adresse <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="address"
              {...register('address', { required: 'L\'adresse est requise' })}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
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
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
            {errors.owner_name && (
              <p className="mt-1 text-sm text-red-600">
                {errors.owner_name.message}
              </p>
            )}
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <Button type="button" variant="outline" onClick={onClose}>
              Annuler
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Enregistrement...' : property ? 'Enregistrer' : 'Ajouter'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}