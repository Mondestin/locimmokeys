import { Building2, Pencil, Trash2, Key } from 'lucide-react';
import { Button } from '../ui/Button';

interface Property {
  id: string;
  address: string;
  owner_name: string;
}

interface PropertyTableProps {
  properties?: Property[];
  isLoading: boolean;
  onEdit: (property: Property) => void;
  onDelete: (id: string) => void;
}

export function PropertyTable({ properties, isLoading, onEdit, onDelete }: PropertyTableProps) {
  if (isLoading) {
    return (
      <div className="p-8 text-center">
        <div className="animate-spin inline-block w-6 h-6 border-2 border-current border-t-transparent text-indigo-600 rounded-full" />
      </div>
    );
  }

  if (!properties?.length) {
    return (
      <div className="p-8 text-center">
        <Building2 className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">Aucune propriété</h3>
        <p className="mt-1 text-sm text-gray-500">
          Commencez par ajouter une nouvelle propriété.
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
              Propriétaire
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {properties.map((property, index) => (
            <tr key={property.id} className={`hover:bg-gray-50 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <Building2 className="h-5 w-5 text-gray-400 mr-3" />
                  <div className="text-sm font-medium text-gray-900">
                    {property.address}
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">{property.owner_name}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div className="flex justify-end gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEdit(property)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    onClick={() => onDelete(property.id)}
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
  );
}