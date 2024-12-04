import { LogOut, User } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/auth';
import { useQuery } from '@tanstack/react-query';
import { getUserProfile } from '../lib/api/users';

interface UserProfileProps {
  onClose: () => void;
}

export function UserProfile({ onClose }: UserProfileProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const { data: profile } = useQuery({
    queryKey: ['userProfile'],
    queryFn: getUserProfile,
    enabled: !!user
  });

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Failed to logout:', error);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 mx-4 sm:mx-0 sm:w-80">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
            {profile?.photoURL ? (
              <img
                src={profile.photoURL}
                alt={profile.displayName || ''}
                className="h-full w-full object-cover"
              />
            ) : (
              <User className="h-6 w-6 text-gray-500" />
            )}
          </div>
          <div>
            <div className="font-medium text-gray-900">
              {profile?.displayName || 'Utilisateur'}
            </div>
            <div className="text-sm text-gray-500">{profile?.email}</div>
          </div>
        </div>
      </div>

      <div className="p-2">
        <Link
          to="/profile"
          className="flex items-center gap-3 px-3 py-2 text-sm text-gray-700 rounded-md hover:bg-gray-100"
          onClick={onClose}
        >
          <User className="h-4 w-4" />
          Votre Profil
        </Link>
        <button
          className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-600 rounded-md hover:bg-red-50"
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4" />
          Se déconnecter
        </button>
      </div>
    </div>
  );
}