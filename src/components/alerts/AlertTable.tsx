import { AlertTriangle, Pencil, Trash2, Calendar, Building2 } from 'lucide-react';
import { Button } from '../ui/Button';
import { useQuery } from '@tanstack/react-query';
import { getKeys } from '../../lib/api/keys';
import { getProperties } from '../../lib/api/properties';
import type { Alert } from '../../lib/api/alerts';

interface AlertTableProps {
  alerts?: Alert[];
  isLoading: boolean;
  onEdit: (alert: Alert) => void;
  onDelete: (id: string) => void;
}

export function AlertTable({ alerts, isLoading, onEdit, onDelete }: AlertTableProps) {
  const { data: keys } = useQuery({
    queryKey: ['keys'],
    queryFn: getKeys
  });

  const { data: properties } = useQuery({
    queryKey: ['properties'],
    queryFn: getProperties
  });

  const getKeyInfo = (keyId: string) => {
    const key = keys?.find(k => k.id === keyId);
    if (!key) return { address: 'N/A', supplier: 'N/A' };

    const property = properties?.find(p => p.id === key.property_id);
    return {
      address: property?.address || 'N/A',
      supplier: key.supplier_name
    };
  };

  if (isLoading) {
    return (
      <div className="p-8 text-center">
        <div className="animate-spin inline-block w-6 h-6 border-2 border-current border-t-transparent text-locimo-blue rounded-full" />
      </div>
    );
  }

  if (!alerts?.length) {
    return (
      <div className="p-8 text-center">
        <AlertTriangle className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">Aucune alerte</h3>
        <p className="mt-1 text-sm text-gray-500">
          Commencez par ajouter une nouvelle alerte.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Propriété
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Date
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Description
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Statut
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {alerts.map((alert, index) => {
            const keyInfo = getKeyInfo(alert.key_id);
            return (
              <tr 
                key={alert.id} 
                className={`hover:bg-gray-50 ${
                  alert.status === 'Pending' ? 'bg-red-50' : index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                }`}
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <Building2 className={`h-5 w-5 ${
                      alert.status === 'Pending' ? 'text-red-500' : 'text-gray-400'
                    } mr-3`} />
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {keyInfo.address}
                      </div>
                      <div className="text-sm text-gray-500">
                        {keyInfo.supplier}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="text-sm text-gray-900">
                      {new Date(alert.alert_date).toLocaleDateString('fr-FR')}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900">{alert.description}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    alert.status === 'Pending'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {alert.status === 'Pending' ? 'En attente' : 'Ignorée'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEdit(alert)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      onClick={() => onDelete(alert.id!)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}