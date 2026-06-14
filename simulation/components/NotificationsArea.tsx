
import React, { useEffect } from 'react';
import { useAppContext } from '../state/AppContext';
import { Notification } from '../types';
import { InformationCircleIcon, ExclamationTriangleIcon as WarningIcon, CheckCircleIcon, XCircleIcon } from './icons';

const NotificationItem: React.FC<{ notification: Notification; onDismiss: () => void }> = ({ notification, onDismiss }) => {
  useEffect(() => {
    const timer = setTimeout(onDismiss, 5000); // Auto-dismiss after 5 seconds
    return () => clearTimeout(timer);
  }, [onDismiss]);

  const getIcon = () => {
    switch (notification.type) {
      case 'info': return <InformationCircleIcon className="w-5 h-5 text-blue-400" />;
      case 'warning': return <WarningIcon className="w-5 h-5 text-yellow-400" />;
      case 'success': return <CheckCircleIcon className="w-5 h-5 text-green-400" />;
      case 'error': return <XCircleIcon className="w-5 h-5 text-red-400" />;
      default: return null;
    }
  };

  return (
    <div 
      className={`p-3 mb-2 rounded-md shadow-lg text-sm flex items-start space-x-2 transition-opacity duration-500 ease-out animate-fadeIn ${
        notification.type === 'info' ? 'bg-blue-900 border border-blue-700 text-blue-100' :
        notification.type === 'warning' ? 'bg-yellow-900 border border-yellow-700 text-yellow-100' :
        notification.type === 'success' ? 'bg-green-900 border border-green-700 text-green-100' :
        'bg-red-900 border border-red-700 text-red-100' // error
      }`}
    >
      <div className="flex-shrink-0 mt-0.5">{getIcon()}</div>
      <div className="flex-grow">{notification.message}</div>
      <button onClick={onDismiss} className="text-gray-400 hover:text-gray-200 text-lg leading-none">&times;</button>
    </div>
  );
};


const NotificationsArea: React.FC = () => {
  const { state, dispatch } = useAppContext();

  return (
    <div className="absolute bottom-2 left-2 right-2 md:left-auto md:w-1/3 max-w-md z-40 max-h-48 overflow-y-auto pr-1">
      {state.notifications.map(notification => (
        <NotificationItem 
          key={notification.id} 
          notification={notification} 
          onDismiss={() => dispatch({ type: 'REMOVE_NOTIFICATION', payload: notification.id })} 
        />
      ))}
    </div>
  );
};

export default NotificationsArea;

// Add this to your tailwind.config.js or a <style> tag in index.html for the animation:
/*
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
.animate-fadeIn {
  animation: fadeIn 0.3s ease-out;
}
*/
// For this response, as we cannot modify tailwind.config.js, the animation might not work directly.
// Basic opacity transition is used instead.
