import { Users, Pencil, Trash2, Mail, Phone, Key } from 'lucide-react';
import { Button } from '../ui/Button';
import type { Supplier } from '../../lib/api/suppliers';

interface SupplierTableProps {
  suppliers?: Supplier[];
  isLoading: boolean;
  onEdit: (supplier: Supplier) => void;
  onDelete: (id: string) => void;
}

export function SupplierTable({ suppliers, isLoading, onEdit, onDelete }: SupplierTableProps) {
  if (isLoading) {
    return (
      <div className="p-8 text-center">
        <div className="animate-spin inline-block w-6 h-6 border-2 border-current border-t-transparent text-indigo-600 rounded-full" />
      </div>
    );
  }

  if (!suppliers?.length) {
    return (
      <div className="p-8 text-center">
        <Users className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">Aucun fournisseur</h3>
        <p className="mt-1 text-sm text-gray-500">
          Commencez par ajouter un nouveau fournisseur.
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
              Fournisseur
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Contact
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {suppliers.map((supplier, index) => (
            <tr key={supplier.id} className={`hover:bg-gray-50 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <Users className="h-5 w-5 text-gray-400 mr-3" />
                  <div className="text-sm font-medium text-gray-900">
                    {supplier.name}
                  </div>
                </div>
              </td>
              <td className="px-6 py-4">
                <div className="space-y-1">
                  <div className="flex items-center text-sm text-gray-900">
                    <Mail className="h-4 w-4 text-gray-400 mr-2" />
                    {supplier.email}
                  </div>
                  <div className="flex items-center text-sm text-gray-900">
                    <Phone className="h-4 w-4 text-gray-400 mr-2" />
                    {supplier.phone}
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div className="flex justify-end gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEdit(supplier)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    onClick={() => onDelete(supplier.id!)}
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