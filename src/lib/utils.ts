import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import Swal from 'sweetalert2';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export async function confirmDelete(title: string, text: string): Promise<boolean> {
  const result = await Swal.fire({
    title,
    text,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#002DB3',
    cancelButtonColor: '#d33',
    confirmButtonText: 'Oui, supprimer',
    cancelButtonText: 'Annuler'
  });

  return result.isConfirmed;
}

export async function showError(title: string, text: string): Promise<void> {
  await Swal.fire({
    title,
    text,
    icon: 'error',
    confirmButtonColor: '#002DB3',
  });
}