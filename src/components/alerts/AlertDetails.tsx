import { X, Calendar, Building2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { getKeys } from '../../lib/api/keys';
import { getProperties } from '../../lib/api/properties';
import { Button } from '../ui/Button';
import type { Alert } from '../../lib/api/alerts';

interface AlertDetailsProps {
  alert: Alert;
  onClose: () => void;
}

export function AlertDetails({ alert, onClose }: AlertDetailsProps) {
  const { data: keys } = useQuery({
    queryKey: ['keys'],
    queryFn: getKeys
  });

  const { data: properties } = useQuery({
    queryKey: ['properties'],
    queryFn: getProperties
  });

  const key = keys?.find(k => k.id === alert.key_id);
  const property = properties?.find(p => p.id === key?.property_id);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full mx-4">
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            Détails de l'Alerte
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="flex items-center gap-4">
            <div className={`h-12 w-12 rounded-full flex items-center justify-center ${
              alert.status === 'Pending' ? 'bg-red-100' : 'bg-gray-100'
            }`}>
              <Calendar className={`h-6 w-6 ${
                alert.status === 'Pending' ? 'text-red-600' : 'text-gray-600'
              }`} />
            </div>
            <div>
              <p className="text-sm text-gray-500">Date de l'alerte</p>
              <p className="font-medium text-gray-900">
                {new Date(alert.alert_date).toLocaleDateString('fr-FR')}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
              <Building2 className="h-6 w-6 text-locimo-blue" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Propriété</p>
              <p className="font-medium text-gray-900">
                {property?.address || 'N/A'}
              </p>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-900 mb-2">Description</h3>
            <p className="text-gray-700 bg-gray-50 rounded-lg p-4">
              {alert.description}
            </p>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-900 mb-2">Statut</h3>
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
              alert.status === 'Pending'
                ? 'bg-red-100 text-red-800'
                : 'bg-gray-100 text-gray-800'
            }`}>
              {alert.status === 'Pending' ? 'En attente' : 'Ignorée'}
            </span>
          </div>
        </div>

        <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-200">
          <Button variant="outline" onClick={onClose}>
            Fermer
          </Button>
        </div>
      </div>
    </div>
  );
}