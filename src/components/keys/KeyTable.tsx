import { Key, Pencil, Trash2, Building2, Eye, ChevronLeft, ChevronRight, Image } from 'lucide-react';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '../ui/Button';
import { getProperties } from '../../lib/api/properties';
import { PhotoGallery } from './PhotoGallery';
import { KeyDetails } from './KeyDetails';
import type { Key as KeyType } from '../../lib/api/keys';
import { format, isValid, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';

interface KeyTableProps {
  keys?: KeyType[];
  isLoading: boolean;
  onEdit: (key: KeyType) => void;
  onDelete: (id: string) => void;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function KeyTable({ 
  keys, 
  isLoading, 
  onEdit, 
  onDelete,
  currentPage,
  totalPages,
  onPageChange
}: KeyTableProps) {
  const [selectedPhotos, setSelectedPhotos] = useState<string[]>([]);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [selectedKey, setSelectedKey] = useState<KeyType | null>(null);

  const { data: properties } = useQuery({
    queryKey: ['properties'],
    queryFn: getProperties
  });

  const getPropertyAddress = (propertyId: string) => {
    return properties?.find(p => p.id === propertyId)?.address || 'N/A';
  };

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'Date non définie';
    
    try {
      const date = parseISO(dateString);
      if (!isValid(date)) {
        return 'Date invalide';
      }
      return format(date, 'dd MMMM yyyy', { locale: fr });
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Date invalide';
    }
  };

  if (isLoading) {
    return (
      <div className="p-8 text-center">
        <div className="animate-spin inline-block w-6 h-6 border-2 border-current border-t-transparent text-locimo-blue rounded-full" />
      </div>
    );
  }

  if (!keys?.length) {
    return (
      <div className="p-8 text-center">
        <Key className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">Aucune clé</h3>
        <p className="mt-1 text-sm text-gray-500">
          Commencez par ajouter une nouvelle clé.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Description
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Propriété
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Fournisseur
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Statut
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Photos
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {keys.map((key, index) => (
              <tr key={key.id} className={`hover:bg-gray-50 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <Key className="h-5 w-5 text-gray-400 mr-3" />
                    <div className="text-sm font-medium text-gray-900">
                      {key.description}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <Building2 className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="text-sm text-gray-900">
                      {getPropertyAddress(key.property_id)}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{key.supplier_name}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {formatDate(key.date)}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    key.status === 'Remise'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {key.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {key.photos?.length > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSelectedPhotos(key.photos);
                        setIsGalleryOpen(true);
                      }}
                    >
                      <Image className="h-4 w-4 mr-1" />
                      {key.photos.length}
                    </Button>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedKey(key)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEdit(key)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      onClick={() => onDelete(key.id!)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm text-gray-600">
            Page {currentPage} sur {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}

      <PhotoGallery
        photos={selectedPhotos}
        isOpen={isGalleryOpen}
        onClose={() => setIsGalleryOpen(false)}
      />

      {selectedKey && (
        <KeyDetails
          keyData={selectedKey}
          onClose={() => setSelectedKey(null)}
        />
      )}
    </>
  );
}