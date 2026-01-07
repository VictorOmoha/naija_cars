import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';
import { useApp } from '../context/AppContext';

const Toast = () => {
  const { toasts, removeToast } = useApp();

  const icons = {
    success: CheckCircle,
    error: AlertCircle,
    info: Info,
  };

  const styles = {
    success: {
      bg: 'bg-emerald-50',
      border: 'border-emerald-200',
      icon: 'text-emerald-500',
      text: 'text-emerald-800',
    },
    error: {
      bg: 'bg-red-50',
      border: 'border-red-200',
      icon: 'text-red-500',
      text: 'text-red-800',
    },
    info: {
      bg: 'bg-naija-50',
      border: 'border-naija-200',
      icon: 'text-naija-500',
      text: 'text-naija-800',
    },
  };

  return (
    <div className="fixed bottom-6 right-6 z-[100] space-y-3">
      <AnimatePresence>
        {toasts.map((toast) => {
          const Icon = icons[toast.type] || Info;
          const style = styles[toast.type] || styles.info;

          return (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, x: 100, scale: 0.9 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              className={`flex items-center gap-3 px-5 py-4 ${style.bg} border ${style.border}
                        rounded-xl shadow-card-hover min-w-[300px] max-w-md`}
            >
              <Icon className={`w-5 h-5 ${style.icon} flex-shrink-0`} />
              <p className={`${style.text} text-sm font-medium flex-1`}>{toast.message}</p>
              <button
                onClick={() => removeToast(toast.id)}
                className={`p-1 hover:bg-white/50 rounded-lg transition-colors ${style.icon}`}
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};

export default Toast;
