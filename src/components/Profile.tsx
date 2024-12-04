import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Camera, Mail, Phone, User, MapPin, Lock, Upload } from 'lucide-react';
import { Button } from './ui/Button';
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

export function Profile() {
  const [isEditingPassword, setIsEditingPassword] = useState(false);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
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
    }
  });

  const { register: registerPassword, handleSubmit: handlePasswordSubmit, formState: { errors: passwordErrors }, reset: resetPassword } = useForm<PasswordFormData>();

  const updateProfileMutation = useMutation({
    mutationFn: async (data: ProfileFormData) => {
      await updateUserProfile({
        displayName: data.displayName,
        email: data.email,
        phone: data.phone,
        address: data.address
      }, photoFile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userProfile'] });
      setPhotoFile(null);
      setPhotoPreview(null);
    }
  });

  const updatePasswordMutation = useMutation({
    mutationFn: async (data: PasswordFormData) => {
      await updateUserPassword(data.currentPassword, data.newPassword);
    },
    onSuccess: () => {
      setIsEditingPassword(false);
      resetPassword();
    }
  });

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
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#002DB3]" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Profil Utilisateur</h1>
        <p className="mt-2 text-sm text-gray-600">
          Gérez vos informations personnelles et vos préférences
        </p>
      </div>

      {/* Rest of the component remains the same */}
    </div>
  );
}