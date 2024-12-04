import { Bell, Menu, User } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from './ui/Button';
import { UserProfile } from './UserProfile';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getAlerts } from '../lib/api/alerts';

interface TopBarProps {
  onMenuClick: () => void;
}

export function TopBar({ onMenuClick }: TopBarProps) {
  const [showProfile, setShowProfile] = useState(false);

  const { data: alerts } = useQuery({
    queryKey: ['alerts'],
    queryFn: getAlerts
  });

  const pendingAlertsCount = alerts?.filter(alert => alert.status === 'Pending').length || 0;

  return (
    <header className="bg-white border-b border-gray-200 fixed w-full z-30 top-0">
      <div className="mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <button
              type="button"
              className="md:hidden -ml-0.5 -mt-0.5 h-12 w-12 inline-flex items-center justify-center rounded-md text-gray-500 hover:text-gray-900"
              onClick={onMenuClick}
            >
              <span className="sr-only">Ouvrir le menu</span>
              <Menu className="h-6 w-6" />
            </button>
            <Link to="/" className="flex items-center gap-2">
              <img src="/logo.svg" alt="Locimo Services" className="h-8 w-auto" />
              <span className="text-xl md:text-2xl font-bold text-[#002DB3] hidden sm:inline">
                Locimo Services
              </span>
            </Link>
          </div>

          <div className="flex items-center gap-4">
            <Link to="/alerts" className="relative">
              <Bell className="h-6 w-6 text-gray-500 hover:text-[#002DB3] transition-colors" />
              {pendingAlertsCount > 0 && (
                <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 text-xs text-white flex items-center justify-center">
                  {pendingAlertsCount}
                </span>
              )}
            </Link>

            <Button
              variant="ghost"
              className="relative"
              onClick={() => setShowProfile(!showProfile)}
            >
              <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                <User className="h-5 w-5 text-gray-500" />
              </div>
            </Button>
          </div>
        </div>
      </div>

      {showProfile && (
        <div className="absolute top-full right-0 w-full sm:w-auto sm:right-4">
          <UserProfile onClose={() => setShowProfile(false)} />
        </div>
      )}
    </header>
  );
}