import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Camera, Mail, Phone, User, MapPin, Lock, Upload } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Alert } from '../components/ui/Alert';
import { useAuth } from '../lib/auth';
import { updateUserProfile, updateUserPassword, getUserProfile } from '../lib/api/users';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface ProfileFormData {
  displayName: string;
  email: string;
  phone: string;
  address: string;
}

interface PasswordFormData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface AlertState {
  message: string;
  type: 'success' | 'error';
}

export function Profile() {
  const [isEditingPassword, setIsEditingPassword] = useState(false);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [alert, setAlert] = useState<AlertState | null>(null);
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: profile, isLoading } = useQuery({
    queryKey: ['userProfile'],
    queryFn: getUserProfile,
    enabled: !!user
  });

  const { register: registerProfile, handleSubmit: handleProfileSubmit, formState: { errors: profileErrors }, reset: resetProfile } = useForm<ProfileFormData>({
    defaultValues: {
      displayName: profile?.displayName || '',
      email: profile?.email || '',
      phone: profile?.phone || '',
      address: profile?.address || '',
    },
  });

  const { register: registerPassword, handleSubmit: handlePasswordSubmit, formState: { errors: passwordErrors }, reset: resetPassword } = useForm<PasswordFormData>();

  useEffect(() => {
    if (profile) {
      resetProfile({
        displayName: profile.displayName,
        email: profile.email,
        phone: profile.phone || '',
        address: profile.address || '',
      });
    }
  }, [profile, resetProfile]);

  const updateProfileMutation = useMutation({
    mutationFn: async (data: ProfileFormData) => {
      await updateUserProfile({
        ...data,
        photoURL: profile?.photoURL
      }, photoFile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userProfile'] });
      setPhotoFile(null);
      setPhotoPreview(null);
      setAlert({
        message: 'Profil mis à jour avec succès',
        type: 'success'
      });
    },
    onError: () => {
      setAlert({
        message: 'Erreur lors de la mise à jour du profil',
        type: 'error'
      });
    }
  });

  const updatePasswordMutation = useMutation({
    mutationFn: async (data: PasswordFormData) => {
      await updateUserPassword(data.currentPassword, data.newPassword);
    },
    onSuccess: () => {
      setIsEditingPassword(false);
      resetPassword();
      setAlert({
        message: 'Mot de passe mis à jour avec succès',
        type: 'success'
      });
    },
    onError: () => {
      setAlert({
        message: 'Erreur lors de la mise à jour du mot de passe',
        type: 'error'
      });
    }
  });

  const handlePhotoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setPhotoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const onProfileSubmit = async (data: ProfileFormData) => {
    try {
      await updateProfileMutation.mutateAsync(data);
    } catch (error) {
      console.error('Failed to update profile:', error);
    }
  };

  const onPasswordSubmit = async (data: PasswordFormData) => {
    try {
      await updatePasswordMutation.mutateAsync(data);
    } catch (error) {
      console.error('Failed to update password:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-locimo-blue" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {alert && (
        <Alert
          message={alert.message}
          type={alert.type}
          onClose={() => setAlert(null)}
        />
      )}

      <div>
        <h1 className="text-2xl font-bold text-gray-900">Profil Utilisateur</h1>
        <p className="mt-2 text-sm text-gray-600">
          Gérez vos informations personnelles et vos préférences
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6">
          <form onSubmit={handleProfileSubmit(onProfileSubmit)} className="space-y-6">
            <div className="flex flex-col items-center space-y-4">
              <div className="relative">
                <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                  {photoPreview ? (
                    <img
                      src={photoPreview}
                      alt="Photo de profil"
                      className="w-full h-full object-cover"
                    />
                  ) : profile?.photoURL ? (
                    <img
                      src={profile.photoURL}
                      alt="Photo de profil"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Camera className="h-12 w-12 text-gray-400" />
                  )}
                </div>
                <label
                  htmlFor="photo"
                  className="absolute bottom-0 right-0 bg-locimo-blue rounded-full p-2 cursor-pointer hover:bg-blue-900 transition-colors"
                >
                  <Upload className="h-4 w-4 text-white" />
                </label>
                <input
                  type="file"
                  id="photo"
                  accept="image/*"
                  className="hidden"
                  onChange={handlePhotoChange}
                />
              </div>
              <p className="text-sm text-gray-500">
                JPG, PNG ou GIF - Max 2MB
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Nom complet
                </label>
                <div className="mt-1 relative">
                  <input
                    type="text"
                    {...registerProfile('displayName', { required: 'Le nom est requis' })}
                    className="pl-10 w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-locimo-blue focus:outline-none focus:ring-1 focus:ring-locimo-blue"
                  />
                  <User className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                </div>
                {profileErrors.displayName && (
                  <p className="mt-1 text-sm text-red-600">{profileErrors.displayName.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <div className="mt-1 relative">
                  <input
                    type="email"
                    {...registerProfile('email', {
                      required: 'L\'email est requis',
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: 'Adresse email invalide',
                      },
                    })}
                    className="pl-10 w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-locimo-blue focus:outline-none focus:ring-1 focus:ring-locimo-blue"
                  />
                  <Mail className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                </div>
                {profileErrors.email && (
                  <p className="mt-1 text-sm text-red-600">{profileErrors.email.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Téléphone
                </label>
                <div className="mt-1 relative">
                  <input
                    type="tel"
                    {...registerProfile('phone', {
                      required: 'Le téléphone est requis',
                      pattern: {
                        value: /^(?:(?:\+|00)33|0)\s*[1-9](?:[\s.-]*\d{2}){4}$/,
                        message: 'Numéro de téléphone invalide',
                      },
                    })}
                    className="pl-10 w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-locimo-blue focus:outline-none focus:ring-1 focus:ring-locimo-blue"
                  />
                  <Phone className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                </div>
                {profileErrors.phone && (
                  <p className="mt-1 text-sm text-red-600">{profileErrors.phone.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Adresse
                </label>
                <div className="mt-1 relative">
                  <input
                    type="text"
                    {...registerProfile('address', { required: 'L\'adresse est requise' })}
                    className="pl-10 w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-locimo-blue focus:outline-none focus:ring-1 focus:ring-locimo-blue"
                  />
                  <MapPin className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                </div>
                {profileErrors.address && (
                  <p className="mt-1 text-sm text-red-600">{profileErrors.address.message}</p>
                )}
              </div>
            </div>

            <div className="flex justify-end">
              <Button 
                type="submit" 
                disabled={updateProfileMutation.isPending}
              >
                {updateProfileMutation.isPending ? 'Enregistrement...' : 'Enregistrer les modifications'}
              </Button>
            </div>
          </form>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-medium text-gray-900">
                Mot de passe
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                Mettez à jour votre mot de passe pour sécuriser votre compte
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsEditingPassword(!isEditingPassword)}
            >
              {isEditingPassword ? 'Annuler' : 'Modifier'}
            </Button>
          </div>

          {isEditingPassword && (
            <form onSubmit={handlePasswordSubmit(onPasswordSubmit)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Mot de passe actuel
                </label>
                <div className="mt-1 relative">
                  <input
                    type="password"
                    {...registerPassword('currentPassword', { required: 'Le mot de passe actuel est requis' })}
                    className="pl-10 w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-locimo-blue focus:outline-none focus:ring-1 focus:ring-locimo-blue"
                  />
                  <Lock className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                </div>
                {passwordErrors.currentPassword && (
                  <p className="mt-1 text-sm text-red-600">{passwordErrors.currentPassword.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Nouveau mot de passe
                </label>
                <div className="mt-1 relative">
                  <input
                    type="password"
                    {...registerPassword('newPassword', {
                      required: 'Le nouveau mot de passe est requis',
                      minLength: {
                        value: 8,
                        message: 'Le mot de passe doit contenir au moins 8 caractères',
                      },
                    })}
                    className="pl-10 w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-locimo-blue focus:outline-none focus:ring-1 focus:ring-locimo-blue"
                  />
                  <Lock className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                </div>
                {passwordErrors.newPassword && (
                  <p className="mt-1 text-sm text-red-600">{passwordErrors.newPassword.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Confirmer le nouveau mot de passe
                </label>
                <div className="mt-1 relative">
                  <input
                    type="password"
                    {...registerPassword('confirmPassword', {
                      required: 'La confirmation du mot de passe est requise',
                      validate: (value) =>
                        value === registerPassword('newPassword').value ||
                        'Les mots de passe ne correspondent pas',
                    })}
                    className="pl-10 w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-locimo-blue focus:outline-none focus:ring-1 focus:ring-locimo-blue"
                  />
                  <Lock className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                </div>
                {passwordErrors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-600">{passwordErrors.confirmPassword.message}</p>
                )}
              </div>

              <div className="flex justify-end">
                <Button 
                  type="submit"
                  disabled={updatePasswordMutation.isPending}
                >
                  {updatePasswordMutation.isPending ? 'Mise à jour...' : 'Mettre à jour le mot de passe'}
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}