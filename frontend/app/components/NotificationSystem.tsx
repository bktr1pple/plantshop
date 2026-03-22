'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bell, 
  X, 
  CheckCircle, 
  AlertCircle, 
  Info, 
  AlertTriangle,
  ShoppingCart,
  Sprout,
  Leaf,
} from 'lucide-react';

// Types
interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info' | 'plant';
  title: string;
  message: string;
  duration?: number;
  icon?: React.ReactNode;
  action?: {
    label: string;
    onClick: () => void;
  };
  image?: string;
}

interface NotificationPosition {
  vertical: 'top' | 'bottom';
  horizontal: 'left' | 'right' | 'center';
}

// Notification context for global access
const NotificationContext = React.createContext<{
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id'>) => void;
  removeNotification: (id: string) => void;
  clearAll: () => void;
} | undefined>(undefined);

// Hook to use notifications
export const useNotification = () => {
  const context = React.useContext(NotificationContext);
  if (!context) throw new Error('useNotification must be used within NotificationProvider');
  return context;
};

// Notification provider component
export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = useCallback((notification: Omit<Notification, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newNotification: Notification = {
      id,
      duration: 5000,
      ...notification,
    };
    
    setNotifications(prev => [newNotification, ...prev.slice(0, 4)]); // Max 5 notifications
  }, []);

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  return (
    <NotificationContext.Provider value={{ notifications, addNotification, removeNotification, clearAll }}>
      {children}
      <NotificationContainer />
    </NotificationContext.Provider>
  );
};

// Individual notification component - REDESIGNED LAYOUT
// Individual notification component - ICON & TITLE TOGETHER
const NotificationItem: React.FC<{
  notification: Notification;
  onClose: (id: string) => void;
}> = ({ notification, onClose }) => {
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [progress, setProgress] = useState(100);

  const handleClose = useCallback(() => {
    onClose(notification.id);
  }, [notification.id, onClose]);

  const startTimer = useCallback(() => {
    if (notification.duration && notification.duration > 0) {
      const startTime = Date.now();
      const totalDuration = notification.duration;
      
      const updateProgress = () => {
        const elapsed = Date.now() - startTime;
        const remaining = Math.max(0, totalDuration - elapsed);
        const newProgress = (remaining / totalDuration) * 100;
        setProgress(newProgress);
        
        if (remaining > 0) {
          timerRef.current = setTimeout(updateProgress, 16);
        } else {
          handleClose();
        }
      };
      
      timerRef.current = setTimeout(updateProgress, 16);
    }
  }, [notification.duration, handleClose]);

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
  }, []);

  useEffect(() => {
    if (!isHovered && notification.duration && notification.duration > 0) {
      startTimer();
    } else {
      clearTimer();
    }
    
    return () => clearTimer();
  }, [isHovered, notification.duration, startTimer, clearTimer]);

  const getNotificationConfig = (type: Notification['type']) => {
    const config = {
      success: {
        icon: <CheckCircle className="w-5 h-5" />,
        gradient: 'from-emerald-500 to-green-500',
        bg: 'bg-emerald-50 dark:bg-emerald-900/20',
        border: 'border-emerald-200 dark:border-emerald-800',
        text: 'text-emerald-800 dark:text-emerald-200'
      },
      error: {
        icon: <AlertCircle className="w-5 h-5" />,
        gradient: 'from-red-500 to-pink-500',
        bg: 'bg-red-50 dark:bg-red-900/20',
        border: 'border-red-200 dark:border-red-800',
        text: 'text-red-800 dark:text-red-200'
      },
      warning: {
        icon: <AlertTriangle className="w-5 h-5" />,
        gradient: 'from-amber-500 to-yellow-500',
        bg: 'bg-amber-50 dark:bg-amber-900/20',
        border: 'border-amber-200 dark:border-amber-800',
        text: 'text-amber-800 dark:text-amber-200'
      },
      info: {
        icon: <Info className="w-5 h-5" />,
        gradient: 'from-blue-500 to-cyan-500',
        bg: 'bg-blue-50 dark:bg-blue-900/20',
        border: 'border-blue-200 dark:border-blue-800',
        text: 'text-blue-800 dark:text-blue-200'
      },
      plant: {
        icon: <Leaf className="w-5 h-5" />,
        gradient: 'from-emerald-500 to-green-500',
        bg: 'bg-emerald-50 dark:bg-emerald-900/20',
        border: 'border-emerald-200 dark:border-emerald-800',
        text: 'text-emerald-800 dark:text-emerald-200'
      }
    };
    return config[type];
  };

  const config = getNotificationConfig(notification.type);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 300, scale: 0.9 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 300, scale: 0.9 }}
      transition={{ 
        type: "spring", 
        stiffness: 500, 
        damping: 30 
      }}
      className="relative group"
      onMouseEnter={() => {
        setIsHovered(true);
        clearTimer();
      }}
      onMouseLeave={() => {
        setIsHovered(false);
        if (notification.duration && notification.duration > 0) {
          startTimer();
        }
      }}
    >
      <div className={`
        relative w-80 rounded-xl shadow-lg backdrop-blur-xl border overflow-hidden
        ${config.bg} ${config.border}
        transform-gpu
      `}>
        {/* Clean Progress Bar */}
        {notification.duration && notification.duration > 0 && (
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-gray-200/30 dark:bg-gray-700/30 z-20">
            <motion.div
              initial={{ width: "100%" }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.1 }}
              className={`h-full bg-gradient-to-r ${config.gradient}`}
            />
          </div>
        )}

        {/* Notification Content */}
        <div className={`p-4 ${notification.duration && notification.duration > 0 ? 'pt-3' : ''}`}>
          {/* Header Row with Icon + Title and Close Button */}
          <div className="flex items-center justify-between mb-2">
            {/* Icon and Title together */}
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ 
                  delay: 0.1, 
                  type: "spring", 
                  stiffness: 300 
                }}
                className={`p-2 rounded-xl bg-gradient-to-br ${config.gradient} text-white shadow-lg flex-shrink-0 group-hover:scale-105 transition-transform duration-200`}
              >
                {notification.icon || config.icon}
              </motion.div>
              
              <motion.h3
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className={`font-semibold text-sm ${config.text} truncate flex-1`}
              >
                {notification.title}
              </motion.h3>
            </div>

            {/* Close Button */}
            <motion.button
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleClose}
              className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-all duration-200 flex-shrink-0 ml-2"
            >
              <X className="w-3 h-3" />
            </motion.button>
          </div>

          <motion.p
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className={`mt-2 text-sm leading-relaxed ${config.text}`}
          >
            {notification.message}
          </motion.p>

          {/* Action Button */}
          {notification.action && (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mt-3"
            >
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={notification.action.onClick}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg bg-gradient-to-r ${config.gradient} text-white shadow-md hover:shadow-lg transition-all duration-200`}
              >
                {notification.action.label}
              </motion.button>
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

// Notification container
const NotificationContainer: React.FC = () => {
  const { notifications, removeNotification } = useNotification();

  return (
    <div className="fixed top-4 right-4 z-50 space-y-3 pointer-events-none">
      <AnimatePresence mode="popLayout">
        {notifications.map((notification) => (
          <div key={notification.id} className="pointer-events-auto">
            <NotificationItem
              notification={notification}
              onClose={removeNotification}
            />
          </div>
        ))}
      </AnimatePresence>
    </div>
  );
};

// Notification trigger component (for demo purposes)
export const NotificationTrigger: React.FC = () => {
  const { addNotification } = useNotification();
  const [notificationCount, setNotificationCount] = useState(0);

  const getRandomPlantMessage = () => {
    const messages = [
      "Your Monstera needs watering! 💧",
      "Time to fertilize your Snake Plant 🌱",
      "Your Fiddle Leaf Fig is growing well! 📈",
      "New leaf spotted on your Peace Lily 🍃",
      "Perfect weather for repotting today 🌞"
    ];
    return messages[Math.floor(Math.random() * messages.length)];
  };

  const showSuccess = () => {
    addNotification({
      type: 'success',
      title: 'Order Confirmed!',
      message: 'Your plant will be delivered tomorrow between 2-4 PM.',
      icon: <ShoppingCart className="w-5 h-5" />,
      action: {
        label: 'Track Order',
        onClick: () => console.log('Tracking order...')
      }
    });
  };

  const showPlantReminder = () => {
    addNotification({
      type: 'plant',
      title: 'Plant Care Reminder',
      message: getRandomPlantMessage(),
      icon: <Sprout className="w-5 h-5" />,
      duration: 6000,
      action: {
        label: 'View Care Guide',
        onClick: () => console.log('Opening care guide...')
      }
    });
  };

  const showWarning = () => {
    addNotification({
      type: 'warning',
      title: 'Low Humidity Alert',
      message: 'Your tropical plants need more moisture. Consider misting.',
      icon: <Leaf className="w-5 h-5" />,
      duration: 7000
    });
  };

  const showError = () => {
    addNotification({
      type: 'error',
      title: 'Delivery Delayed',
      message: 'Unexpected weather conditions have delayed your plant delivery.',
      duration: 8000,
      action: {
        label: 'Reschedule',
        onClick: () => console.log('Rescheduling delivery...')
      }
    });
  };

  const showInfo = () => {
    addNotification({
      type: 'info',
      title: 'New Plant Available',
      message: 'Rare Variegated Monstera is back in stock! Limited quantity.',
      duration: 5000,
      action: {
        label: 'Shop Now',
        onClick: () => console.log('Opening shop...')
      }
    });
  };

  const showRandomNotification = () => {
    const types: Notification['type'][] = ['success', 'error', 'warning', 'info', 'plant'];
    const randomType = types[Math.floor(Math.random() * types.length)];
    
    const notifications = {
      success: {
        title: 'Care Task Completed!',
        message: 'You\'ve watered all your plants for this week. Great job! 🌟',
        icon: <CheckCircle className="w-5 h-5" />
      },
      error: {
        title: 'Watering Missed',
        message: 'You missed watering your Snake Plant yesterday.',
        icon: <AlertCircle className="w-5 h-5" />
      },
      warning: {
        title: 'Temperature Warning',
        message: 'Low temperatures detected. Move sensitive plants indoors.',
        icon: <AlertTriangle className="w-5 h-5" />
      },
      info: {
        title: 'Seasonal Tip',
        message: 'Spring is the perfect time for repotting and propagation!',
        icon: <Info className="w-5 h-5" />
      },
      plant: {
        title: 'Growth Update',
        message: 'Your Monstera has grown 2 new leaves this month!',
        icon: <Leaf className="w-5 h-5" />
      }
    };

    addNotification({
      type: randomType,
      ...notifications[randomType],
      duration: 6000
    });

    setNotificationCount(prev => prev + 1);
  };

  return (
    <div className="fixed bottom-6 left-6 z-40">
      <GlassCard className="p-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
            <Bell className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">Notifications</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Test the notification system
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={showSuccess}
            className="px-3 py-2 bg-emerald-500 text-white rounded-lg text-xs font-medium"
          >
            Success
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={showPlantReminder}
            className="px-3 py-2 bg-green-500 text-white rounded-lg text-xs font-medium"
          >
            Plant Care
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={showWarning}
            className="px-3 py-2 bg-amber-500 text-white rounded-lg text-xs font-medium"
          >
            Warning
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={showError}
            className="px-3 py-2 bg-red-500 text-white rounded-lg text-xs font-medium"
          >
            Error
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={showInfo}
            className="px-3 py-2 bg-blue-500 text-white rounded-lg text-xs font-medium"
          >
            Info
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={showRandomNotification}
            className="px-3 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg text-xs font-medium col-span-2"
          >
            Random ({notificationCount})
          </motion.button>
        </div>
      </GlassCard>
    </div>
  );
};

// Glass card component (reused from your design system)
const GlassCard = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <motion.div
    whileHover={{ scale: 1.02, y: -2 }}
    className={`bg-white/10 dark:bg-gray-900/20 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl shadow-black/5 ${className}`}
  >
    {children}
  </motion.div>
);

// Export everything
export { NotificationContext };
export default NotificationProvider;
