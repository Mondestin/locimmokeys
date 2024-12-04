import { X, Key as KeyIcon, Building2, User, Calendar, FileText } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { getProperties } from '../../lib/api/properties';
import { Button } from '../ui/Button';
import { PhotoGallery } from './PhotoGallery';
import { useState } from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import type { Key } from '../../lib/api/keys';

interface KeyDetailsProps {
  keyData: Key;
  onClose: () => void;
}

export function KeyDetails({ keyData, onClose }: KeyDetailsProps) {
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);

  const { data: properties } = useQuery({
    queryKey: ['properties'],
    queryFn: getProperties
  });

  const property = properties?.find(p => p.id === keyData.property_id);

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            Détails de la Clé
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6 space-y-6 overflow-y-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <KeyIcon className="h-6 w-6 text-locimo-blue" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Description</p>
                <p className="font-medium text-gray-900">{keyData.description}</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Building2 className="h-6 w-6 text-locimo-blue" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Propriété</p>
                <p className="font-medium text-gray-900">
                  {property?.address || 'N/A'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <User className="h-6 w-6 text-locimo-blue" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Fournisseur</p>
                <p className="font-medium text-gray-900">{keyData.supplier_name}</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Calendar className="h-6 w-6 text-locimo-blue" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Date</p>
                <p className="font-medium text-gray-900">
                  {format(new Date(keyData.date), 'dd MMMM yyyy', { locale: fr })}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Calendar className="h-6 w-6 text-locimo-blue" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Statut</p>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  keyData.status === 'Remise'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {keyData.status}
                </span>
              </div>
            </div>
          </div>

          {keyData.photos?.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-3">Photos</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {keyData.photos.map((photo, index) => (
                  <button
                    key={index}
                    onClick={() => setIsGalleryOpen(true)}
                    className="aspect-square rounded-lg overflow-hidden hover:opacity-75 transition-opacity border border-gray-200"
                  >
                    <img
                      src={photo}
                      alt={`Photo ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>
          )}

          {keyData.signature && (
            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-3">Signature</h3>
              <div className="border rounded-lg p-2 bg-gray-50">
                <img
                  src={keyData.signature}
                  alt="Signature"
                  className="max-h-32"
                />
              </div>
            </div>
          )}

          {keyData.commentaires && (
            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-3">
                <FileText className="h-4 w-4 inline-block mr-2" />
                Commentaires
              </h3>
              <p className="text-gray-700 bg-gray-50 rounded-lg p-4">
                {keyData.commentaires}
              </p>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-200">
          <Button variant="outline" onClick={onClose}>
            Fermer
          </Button>
        </div>
      </div>

      <PhotoGallery
        photos={keyData.photos || []}
        isOpen={isGalleryOpen}
        onClose={() => setIsGalleryOpen(false)}
      />
    </div>
  );
}