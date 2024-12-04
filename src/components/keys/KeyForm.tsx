import { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { X, Camera } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import SignatureCanvas from 'react-signature-canvas';
import { Button } from '../ui/Button';
import { getProperties } from '../../lib/api/properties';
import { getSuppliers } from '../../lib/api/suppliers';
import type { Key } from '../../lib/api/keys';

interface KeyFormProps {
  keyData?: Key | null;
  onClose: () => void;
  onSubmit: (data: Omit<Key, 'id'>) => Promise<void>;
  isSubmitting: boolean;
}

export function KeyForm({ keyData, onClose, onSubmit, isSubmitting }: KeyFormProps) {
  const [photos, setPhotos] = useState<File[]>([]);
  const [photosPreviews, setPhotosPreviews] = useState<string[]>(keyData?.photos || []);
  const [signatureError, setSignatureError] = useState<string | null>(null);
  const [photosError, setPhotosError] = useState<string | null>(null);
  const signatureRef = useRef<SignatureCanvas>(null);
  
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      property_id: keyData?.property_id || '',
      supplier_name: keyData?.supplier_name || '',
      status: keyData?.status || 'Remise',
      description: keyData?.description || '',
      date: keyData?.date || new Date().toISOString().split('T')[0],
      commentaires: keyData?.commentaires || '',
    },
  });

  const { data: properties } = useQuery({
    queryKey: ['properties'],
    queryFn: getProperties
  });

  const { data: suppliers } = useQuery({
    queryKey: ['suppliers'],
    queryFn: getSuppliers
  });

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setPhotos(prev => [...prev, ...files]);
    setPhotosError(null);
    
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotosPreviews(prev => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const clearSignature = () => {
    signatureRef.current?.clear();
    setSignatureError(null);
  };

  const handleFormSubmit = async (formData: any) => {
    let hasError = false;
    const signatureDataUrl = signatureRef.current?.toDataURL();
    
    if (!signatureDataUrl || signatureDataUrl === signatureRef.current?.toDataURL('')) {
      setSignatureError('La signature est requise');
      hasError = true;
    } else {
      setSignatureError(null);
    }

    if (photosPreviews.length === 0) {
      setPhotosError('Au moins une photo est requise');
      hasError = true;
    } else {
      setPhotosError(null);
    }

    if (hasError) return;
    
    await onSubmit({
      ...formData,
      photos: photosPreviews,
      signature: signatureDataUrl,
    });
  };

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {keyData ? 'Modifier la Clé' : 'Ajouter une Clé'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="p-6 space-y-6">
          <div>
            <label htmlFor="property_id" className="block text-sm font-medium text-gray-700">
              Propriété <span className="text-red-500">*</span>
            </label>
            <select
              id="property_id"
              {...register('property_id', { required: 'La propriété est requise' })}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-locimo-blue focus:outline-none focus:ring-1 focus:ring-locimo-blue"
            >
              <option value="">Sélectionner une propriété</option>
              {properties?.map((property) => (
                <option key={property.id} value={property.id}>
                  {property.address}
                </option>
              ))}
            </select>
            {errors.property_id && (
              <p className="mt-1 text-sm text-red-600">{errors.property_id.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="supplier_name" className="block text-sm font-medium text-gray-700">
              Fournisseur <span className="text-red-500">*</span>
            </label>
            <select
              id="supplier_name"
              {...register('supplier_name', { required: 'Le fournisseur est requis' })}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-locimo-blue focus:outline-none focus:ring-1 focus:ring-locimo-blue"
            >
              <option value="">Sélectionner un fournisseur</option>
              {suppliers?.map((supplier) => (
                <option key={supplier.id} value={supplier.name}>
                  {supplier.name}
                </option>
              ))}
            </select>
            {errors.supplier_name && (
              <p className="mt-1 text-sm text-red-600">{errors.supplier_name.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700">
              Statut <span className="text-red-500">*</span>
            </label>
            <select
              id="status"
              {...register('status', { required: 'Le statut est requis' })}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-locimo-blue focus:outline-none focus:ring-1 focus:ring-locimo-blue"
            >
              <option value="Remise">Remise</option>
              <option value="Retrait">Retrait</option>
            </select>
            {errors.status && (
              <p className="mt-1 text-sm text-red-600">{errors.status.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
              Description <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="description"
              {...register('description', { required: 'La description est requise' })}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-locimo-blue focus:outline-none focus:ring-1 focus:ring-locimo-blue"
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="date" className="block text-sm font-medium text-gray-700">
              Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              id="date"
              {...register('date', { required: 'La date est requise' })}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-locimo-blue focus:outline-none focus:ring-1 focus:ring-locimo-blue"
            />
            {errors.date && (
              <p className="mt-1 text-sm text-red-600">{errors.date.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Photos des clés <span className="text-red-500">*</span>
            </label>
            <div className="space-y-4">
              <div className="flex flex-wrap gap-4">
                {photosPreviews.map((preview, index) => (
                  <div key={index} className="relative w-24 h-24">
                    <img
                      src={preview}
                      alt={`Photo ${index + 1}`}
                      className="w-full h-full object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setPhotosPreviews(prev => prev.filter((_, i) => i !== index));
                        setPhotos(prev => prev.filter((_, i) => i !== index));
                        if (photosPreviews.length === 1) {
                          setPhotosError('Au moins une photo est requise');
                        }
                      }}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-center w-full">
                <label className={`w-full flex flex-col items-center px-4 py-6 bg-white rounded-lg border-2 border-dashed transition-colors ${
                  photosError ? 'border-red-500' : 'border-gray-300'
                } cursor-pointer hover:bg-gray-50`}>
                  <Camera className={`h-12 w-12 ${photosError ? 'text-red-500' : 'text-gray-400'}`} />
                  <span className={`mt-2 text-sm ${photosError ? 'text-red-500' : 'text-gray-500'}`}>
                    Ajouter des photos
                  </span>
                  <input
                    type="file"
                    className="hidden"
                    multiple
                    accept="image/*"
                    onChange={handlePhotoChange}
                  />
                </label>
              </div>
              {photosError && (
                <p className="text-sm text-red-600">{photosError}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Signature <span className="text-red-500">*</span>
            </label>
            <div className={`border rounded-lg p-2 bg-white ${signatureError ? 'border-red-500' : ''}`}>
              <SignatureCanvas
                ref={signatureRef}
                canvasProps={{
                  className: `w-full h-40 border rounded ${signatureError ? 'border-red-500' : ''}`,
                  style: { touchAction: 'none' }
                }}
                onEnd={() => setSignatureError(null)}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="mt-2"
                onClick={clearSignature}
              >
                Effacer
              </Button>
            </div>
            {signatureError && (
              <p className="mt-1 text-sm text-red-600">{signatureError}</p>
            )}
          </div>

          <div>
            <label htmlFor="commentaires" className="block text-sm font-medium text-gray-700">
              Commentaires
            </label>
            <textarea
              id="commentaires"
              rows={4}
              {...register('commentaires')}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-locimo-blue focus:outline-none focus:ring-1 focus:ring-locimo-blue"
            />
          </div>

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={onClose}>
              Annuler
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Enregistrement...' : keyData ? 'Enregistrer' : 'Ajouter'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}