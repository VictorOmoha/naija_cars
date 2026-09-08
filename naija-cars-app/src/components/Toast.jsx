import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';
import { useApp } from '../context/AppContext';

const Toast = () => {
  const { toasts, removeToast } = useApp();
  const reduceMotion = useReducedMotion();

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
    <div className="nc-toast-stack" role="status" aria-live="polite" aria-atomic="false">
      <AnimatePresence initial={false}>
        {toasts.map((toast) => {
          const Icon = icons[toast.type] || Info;
          const style = styles[toast.type] || styles.info;

          return (
            <motion.div
              key={toast.id}
              layout="position"
              initial={{ opacity: 0, y: reduceMotion ? 0 : 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: reduceMotion ? 0 : 6 }}
              transition={{ duration: reduceMotion ? 0 : 0.2, ease: [0.22, 1, 0.36, 1] }}
              className={`flex items-center gap-3 px-5 py-4 ${style.bg} border ${style.border}
                        rounded-xl shadow-card-hover w-full`}
            >
              <Icon className={`w-5 h-5 ${style.icon} flex-shrink-0`} />
              <p className={`${style.text} text-sm font-medium flex-1`}>{toast.message}</p>
              <button
                aria-label="Dismiss notification"
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
