
import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { BellRing, X } from 'lucide-react';

interface ToastProps {
  message: string;
  onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({ message, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 5000); // Auto-dismiss after 5 seconds

    return () => {
      clearTimeout(timer);
    };
  }, [onClose]);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 50, scale: 0.3 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.5 }}
      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      className="fixed bottom-5 right-5 z-50 p-4 rounded-lg shadow-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex items-start gap-4 max-w-sm"
      role="alert"
    >
        <div className="text-blue-500 pt-1">
            <BellRing size={20} />
        </div>
        <div className="flex-grow">
            <p className="font-semibold">Reminder</p>
            <p className="text-sm text-gray-600 dark:text-gray-300">{message}</p>
        </div>
        <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 -mr-2 -mt-2">
            <X size={16} />
        </button>
    </motion.div>
  );
};

export default Toast;
