import React, { useEffect } from 'react';

const Toast = ({ message, type = 'success', duration = 3000, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      if (onClose) onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const getIcon = () => {
    const icons = {
      success: '✓',
      error: '✕',
      warning: '⚠',
      info: 'ℹ'
    };
    return icons[type] || icons.info;
  };

  const getColors = () => {
    const colors = {
      success: 'bg-green-500/90 border-green-400/50',
      error: 'bg-red-500/90 border-red-400/50',
      warning: 'bg-orange-500/90 border-orange-400/50',
      info: 'bg-blue-500/90 border-blue-400/50'
    };
    return colors[type] || colors.info;
  };

  return (
    <div className={`flex items-center gap-3 px-5 py-4 ${getColors()} backdrop-blur-xl border text-white rounded-xl shadow-[0_8px_30px_rgba(0,0,0,0.3)] min-w-[300px] max-w-[500px] animate-[slideInRight_0.3s_ease-out]`}>
      <span className="text-xl flex-shrink-0">{getIcon()}</span>
      <span className="flex-1 text-sm">{message}</span>
      <button 
        className="w-6 h-6 bg-white/20 backdrop-blur-sm text-white text-sm font-bold border-none rounded flex items-center justify-center cursor-pointer transition-all duration-300 hover:bg-white/30" 
        onClick={onClose}
      >
        ✕
      </button>
    </div>
  );
};

const ToastContainer = ({ toasts, onRemoveToast }) => {
  return (
    <div className="fixed top-5 right-5 z-[9999] flex flex-col gap-3">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          duration={toast.duration}
          onClose={() => onRemoveToast(toast.id)}
        />
      ))}
    </div>
  );
};

export { Toast, ToastContainer };
export default ToastContainer;
