import { useEffect, useState } from 'react';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';
import clsx from 'clsx';

const Toast = ({ message, type = 'info', onClose, duration = 4000 }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300);
    }, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const icons = {
    success: <CheckCircle className="w-5 h-5 text-green-500" />,
    error: <AlertCircle className="w-5 h-5 text-red-500" />,
    info: <Info className="w-5 h-5 text-blue-500" />,
  };

  const colors = {
    success: 'bg-green-50 dark:bg-green-900/50 border-green-200 dark:border-green-800',
    error: 'bg-red-50 dark:bg-red-900/50 border-red-200 dark:border-red-800',
    info: 'bg-blue-50 dark:bg-blue-900/50 border-blue-200 dark:border-blue-800',
  };

  return (
    <div
      className={clsx(
        'fixed top-4 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-lg border shadow-lg transition-all duration-300',
        colors[type],
        isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-full'
      )}
    >
      {icons[type]}
      <p className="text-sm text-gray-700 dark:text-gray-200">{message}</p>
      <button onClick={() => { setIsVisible(false); setTimeout(onClose, 300); }} className="ml-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

export default Toast;