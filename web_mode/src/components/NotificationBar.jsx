import React, { useState, useEffect } from 'react';

const NotificationBar = ({ notifications, onDismiss }) => {
  const [visible, setVisible] = useState(false);
  const [currentNotification, setCurrentNotification] = useState(null);

  useEffect(() => {
    if (notifications && notifications.length > 0) {
      setCurrentNotification(notifications[0]);
      setVisible(true);

      // Auto dismiss after 5 seconds
      const timer = setTimeout(() => {
        setVisible(false);
        setTimeout(() => {
          if (onDismiss) onDismiss();
        }, 300);
      }, 5000);

      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [notifications]);

  const handleDismiss = () => {
    setVisible(false);
    setTimeout(() => {
      if (onDismiss) onDismiss();
    }, 300);
  };

  if (!currentNotification) return null;

  const getNotificationStyle = (type) => {
    const styles = {
      'flash-sale': { bg: '#ef4444', icon: '⚡' },
      'offer': { bg: '#f59e0b', icon: '🎁' },
      'stock': { bg: '#dc2626', icon: '⚠️' },
      'loyalty': { bg: '#8b5cf6', icon: '⭐' },
      'success': { bg: '#10b981', icon: '✓' },
      'info': { bg: '#3b82f6', icon: 'ℹ️' }
    };
    return styles[type] || styles['info'];
  };

  const style = getNotificationStyle(currentNotification.type);

  return (
    <div className={`fixed top-0 left-0 right-0 z-[9999] transition-transform duration-300 ${visible ? 'translate-y-0' : '-translate-y-full'}`}>
      <div 
        className="flex items-center justify-between px-6 py-4 text-white shadow-[0_4px_20px_rgba(0,0,0,0.3)] relative overflow-hidden" 
        style={{ background: style.bg }}
      >
        <span className="text-2xl mr-3">{style.icon}</span>
        <div className="flex-1 min-w-0">
          <div className="text-base font-bold mb-0.5">{currentNotification.title}</div>
          {currentNotification.subtitle && (
            <div className="text-sm opacity-90">{currentNotification.subtitle}</div>
          )}
        </div>
        {currentNotification.action && (
          <button 
            className="px-6 py-2 bg-white/20 backdrop-blur-sm text-white text-sm font-semibold border-none rounded-lg cursor-pointer transition-all duration-300 mr-4 hover:bg-white/30 hover:-translate-y-0.5" 
            onClick={currentNotification.action.onClick}
          >
            {currentNotification.action.label}
          </button>
        )}
        <button 
          className="w-8 h-8 bg-white/20 backdrop-blur-sm text-white text-lg font-bold border-none rounded-lg cursor-pointer transition-all duration-300 flex items-center justify-center hover:bg-white/30" 
          onClick={handleDismiss}
        >
          ✕
        </button>
      </div>
      <div 
        className="absolute bottom-0 left-0 h-1 animate-[progressBar_5s_linear]" 
        style={{ background: style.bg }}
      />
    </div>
  );
};

export default NotificationBar;
