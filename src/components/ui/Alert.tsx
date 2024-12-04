import { AlertCircle, CheckCircle2, XCircle } from 'lucide-react';
import { useEffect, useState } from 'react';

interface AlertProps {
  message: string;
  type: 'success' | 'error';
  onClose: () => void;
  duration?: number;
}

export function Alert({ message, type, onClose, duration = 3000 }: AlertProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300); // Allow time for fade out animation
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  return (
    <div
      className={`fixed top-4 right-4 z-50 transition-opacity duration-300 ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}
    >
      <div className={`flex items-center gap-2 p-4 rounded-lg shadow-lg ${
        type === 'success' 
          ? 'bg-green-50 text-green-800 border border-green-200'
          : 'bg-red-50 text-red-800 border border-red-200'
      }`}>
        {type === 'success' ? (
          <CheckCircle2 className="h-5 w-5" />
        ) : (
          <XCircle className="h-5 w-5" />
        )}
        <p className="text-sm font-medium">{message}</p>
        <button
          onClick={onClose}
          className="ml-4 text-gray-500 hover:text-gray-700"
        >
          <AlertCircle className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}