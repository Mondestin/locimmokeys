import { Building2, Key as KeyIcon, Users, AlertTriangle } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { getProperties } from '../lib/api/properties';
import { getKeys } from '../lib/api/keys';
import { getSuppliers } from '../lib/api/suppliers';
import { getAlerts } from '../lib/api/alerts';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isToday, isSameDay } from 'date-fns';
import { fr } from 'date-fns/locale';
import { AlertDetails } from '../components/alerts/AlertDetails';
import { KeyDetails } from '../components/keys/KeyDetails';
import type { Alert } from '../lib/api/alerts';
import type { Key } from '../lib/api/keys';

export function Dashboard() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);
  const [selectedKey, setSelectedKey] = useState<Key | null>(null);

  const { data: properties } = useQuery({
    queryKey: ['properties'],
    queryFn: getProperties
  });

  const { data: keys } = useQuery({
    queryKey: ['keys'],
    queryFn: getKeys
  });

  const { data: suppliers } = useQuery({
    queryKey: ['suppliers'],
    queryFn: getSuppliers
  });

  const { data: alerts } = useQuery({
    queryKey: ['alerts'],
    queryFn: getAlerts
  });

  // Key statistics
  const keyStats = {
    remise: keys?.filter(k => k.status === 'Remise').length || 0,
    retrait: keys?.filter(k => k.status === 'Retrait').length || 0,
    recentKeys: keys?.sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    ).slice(0, 5) || []
  };

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const getAlertsForDay = (date: Date) => {
    return alerts?.filter(alert => 
      isSameDay(new Date(alert.alert_date), date)
    ) || [];
  };

  const getKeysForDay = (date: Date) => {
    return keys?.filter(key => 
      isSameDay(new Date(key.date), date)
    ) || [];
  };

  const previousMonth = () => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1));
  };

  const stats = [
    { 
      name: 'Total Propriétés',
      value: properties?.length || 0,
      icon: Building2
    },
    { 
      name: 'Clés Actives',
      value: keys?.length || 0,
      icon: KeyIcon
    },
    { 
      name: 'Fournisseurs',
      value: suppliers?.length || 0,
      icon: Users
    },
    { 
      name: 'Alertes en Attente',
      value: alerts?.filter(a => a.status === 'Pending').length || 0,
      icon: AlertTriangle,
      urgent: true
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Tableau de bord</h1>
        <p className="mt-2 text-sm text-gray-600">
          Bienvenue ! Voici ce qui se passe avec vos propriétés aujourd'hui.
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Aperçu des Clés</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <div className="bg-green-50 rounded-lg p-4 border border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">Clés Remises</p>
                <p className="mt-1 text-2xl font-semibold text-green-700">{keyStats.remise}</p>
              </div>
              <div className="h-10 w-10 bg-green-100 rounded-full flex items-center justify-center">
                <KeyIcon className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </div>
          <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-yellow-600">Clés en Retrait</p>
                <p className="mt-1 text-2xl font-semibold text-yellow-700">{keyStats.retrait}</p>
              </div>
              <div className="h-10 w-10 bg-yellow-100 rounded-full flex items-center justify-center">
                <KeyIcon className="h-5 w-5 text-yellow-600" />
              </div>
            </div>
          </div>
        </div>
        <div>
          <h3 className="text-sm font-medium text-gray-900 mb-3">Clés Récentes</h3>
          <div className="space-y-2">
            {keyStats.recentKeys.map((key) => (
              <button
                key={key.id}
                onClick={() => setSelectedKey(key)}
                className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <KeyIcon className={`h-5 w-5 ${
                    key.status === 'Remise' ? 'text-green-500' : 'text-yellow-500'
                  }`} />
                  <div className="text-left">
                    <p className="text-sm font-medium text-gray-900">{key.description}</p>
                    <p className="text-sm text-gray-500">{key.supplier_name}</p>
                  </div>
                </div>
                <span className="text-sm text-gray-500">
                  {format(new Date(key.date), 'dd MMM yyyy', { locale: fr })}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Calendrier</h2>
            <div className="flex items-center gap-4">
              <button
                onClick={previousMonth}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                ←
              </button>
              <span className="text-lg font-medium">
                {format(currentMonth, 'MMMM yyyy', { locale: fr })}
              </span>
              <button
                onClick={nextMonth}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                →
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-px bg-gray-200 rounded-lg overflow-hidden">
            {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map((day) => (
              <div
                key={day}
                className="bg-gray-50 p-2 text-center text-sm font-medium text-gray-500"
              >
                {day}
              </div>
            ))}
            {Array.from({ length: monthStart.getDay() - 1 }).map((_, index) => (
              <div key={`empty-start-${index}`} className="bg-white" />
            ))}
            {days.map((day) => {
              const dayAlerts = getAlertsForDay(day);
              const dayKeys = getKeysForDay(day);
              const hasAlerts = dayAlerts.length > 0;
              const hasKeys = dayKeys.length > 0;
              const hasPendingAlerts = dayAlerts.some(alert => alert.status === 'Pending');
              
              return (
                <div
                  key={day.toISOString()}
                  className={`bg-white p-2 min-h-[100px] ${
                    isToday(day) ? 'bg-blue-50' : ''
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`text-sm ${
                      isToday(day) ? 'font-bold text-locimo-blue' : 'text-gray-700'
                    }`}>
                      {format(day, 'd')}
                    </span>
                    <div className="flex gap-1">
                      {hasAlerts && (
                        <div className={`h-2 w-2 rounded-full ${
                          hasPendingAlerts ? 'bg-red-500' : 'bg-green-500'
                        }`} />
                      )}
                      {hasKeys && (
                        <div className="h-2 w-2 rounded-full bg-locimo-blue" />
                      )}
                    </div>
                  </div>
                  <div className="space-y-1 mt-1">
                    {dayAlerts.map((alert) => (
                      <button
                        key={alert.id}
                        onClick={() => setSelectedAlert(alert)}
                        className={`p-1 text-xs rounded w-full text-left transition-colors ${
                          alert.status === 'Pending'
                            ? 'bg-red-100 text-red-800 hover:bg-red-200'
                            : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                        }`}
                      >
                        <AlertTriangle className="h-3 w-3 inline-block mr-1" />
                        {alert.description.slice(0, 20)}
                        {alert.description.length > 20 ? '...' : ''}
                      </button>
                    ))}
                    {dayKeys.map((key) => (
                      <button
                        key={key.id}
                        onClick={() => setSelectedKey(key)}
                        className="p-1 text-xs rounded w-full text-left bg-blue-100 text-blue-800 hover:bg-blue-200 transition-colors"
                      >
                        <KeyIcon className="h-3 w-3 inline-block mr-1" />
                        {key.description.slice(0, 20)}
                        {key.description.length > 20 ? '...' : ''}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
            {Array.from({ length: (7 - monthEnd.getDay()) % 7 }).map((_, index) => (
              <div key={`empty-end-${index}`} className="bg-white" />
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.name}
            className={`bg-white p-6 rounded-lg shadow-sm border ${
              stat.urgent && stat.value > 0 ? 'border-red-200 bg-red-50' : 'border-gray-200'
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                <p className={`mt-1 text-3xl font-semibold ${
                  stat.urgent && stat.value > 0 ? 'text-red-600' : 'text-gray-900'
                }`}>
                  {stat.value}
                </p>
              </div>
              <div className={`h-12 w-12 rounded-full flex items-center justify-center ${
                stat.urgent && stat.value > 0 ? 'bg-red-100' : 'bg-blue-50'
              }`}>
                <stat.icon className={`h-6 w-6 ${
                  stat.urgent && stat.value > 0 ? 'text-red-600' : 'text-locimo-blue'
                }`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {selectedAlert && (
        <AlertDetails
          alert={selectedAlert}
          onClose={() => setSelectedAlert(null)}
        />
      )}

      {selectedKey && (
        <KeyDetails
          keyData={selectedKey}
          onClose={() => setSelectedKey(null)}
        />
      )}
    </div>
  );
}