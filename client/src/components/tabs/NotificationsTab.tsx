import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Bell, AlertTriangle, CheckCircle, Info, Trash2, ArchiveX } from 'lucide-react';

export const NotificationsTab: React.FC = () => {
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: 'high-risk',
      title: 'High Risk Alert',
      message: 'Personnel A shows elevated stress markers. Recommend immediate welfare check-in.',
      timestamp: '2 hours ago',
      read: false,
    },
    {
      id: 2,
      type: 'medium-risk',
      title: 'Elevated Stress Detected',
      message: 'Personnel B stress score trending upward. Schedule preventive counseling.',
      timestamp: '4 hours ago',
      read: false,
    },
    {
      id: 3,
      type: 'info',
      title: 'Deployment Completion',
      message: 'Personnel C completed 12-month deployment. Recommend reintegration support.',
      timestamp: '1 day ago',
      read: true,
    },
    {
      id: 4,
      type: 'success',
      title: 'Intervention Success',
      message: 'Personnel D stress scores improved by 35% following recommended interventions.',
      timestamp: '2 days ago',
      read: true,
    },
  ]);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'high-risk':
        return <AlertTriangle className="w-5 h-5 text-red-600" />;
      case 'medium-risk':
        return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'info':
        return <Info className="w-5 h-5 text-blue-600" />;
      default:
        return <Bell className="w-5 h-5 text-slate-600" />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'high-risk':
        return 'bg-red-50 border-red-200';
      case 'medium-risk':
        return 'bg-yellow-50 border-yellow-200';
      case 'success':
        return 'bg-green-50 border-green-200';
      case 'info':
        return 'bg-blue-50 border-blue-200';
      default:
        return 'bg-slate-50 border-slate-200';
    }
  };

  const deleteNotification = (id: number) => {
    setNotifications(notifications.filter(n => n.id !== id));
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Notifications</h1>
          <p className="text-slate-600">
            Welfare alerts and important system notifications
          </p>
        </div>
        <div className="bg-red-100 text-red-700 px-4 py-2 rounded-lg font-bold">
          {unreadCount} New
        </div>
      </div>

      {/* Filter & Actions */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex gap-3 flex-wrap"
      >
        <button className="px-4 py-2 bg-olive-600 hover:bg-olive-700 text-white rounded-lg font-semibold transition-colors">
          All ({notifications.length})
        </button>
        <button className="px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg font-semibold transition-colors">
          High Risk ({notifications.filter(n => n.type === 'high-risk').length})
        </button>
        <button className="px-4 py-2 bg-yellow-100 hover:bg-yellow-200 text-yellow-700 rounded-lg font-semibold transition-colors">
          Warnings ({notifications.filter(n => n.type === 'medium-risk').length})
        </button>
        <div className="ml-auto">
          <button className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg font-semibold transition-colors flex items-center gap-2">
            <ArchiveX className="w-4 h-4" />
            Mark All Read
          </button>
        </div>
      </motion.div>

      {/* Notifications List */}
      <div className="space-y-4">
        {notifications.map((notification, idx) => (
          <motion.div
            key={notification.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            className={`border rounded-lg p-4 flex items-start gap-4 ${getNotificationColor(notification.type)} ${
              !notification.read ? 'border-l-4' : ''
            }`}
          >
            <div className="flex-shrink-0 mt-0.5">
              {getNotificationIcon(notification.type)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between mb-1">
                <h3 className="font-bold text-slate-900">{notification.title}</h3>
                {!notification.read && (
                  <span className="w-2 h-2 rounded-full bg-red-600 flex-shrink-0 mt-2"></span>
                )}
              </div>
              <p className="text-slate-700 mb-2">{notification.message}</p>
              <div className="flex items-center justify-between">
                <p className="text-xs text-slate-600">{notification.timestamp}</p>
                <div className="flex gap-2">
                  <button className="text-xs text-slate-600 hover:text-slate-900 font-semibold">
                    {!notification.read ? 'Mark Read' : 'Mark Unread'}
                  </button>
                  <button
                    onClick={() => deleteNotification(notification.id)}
                    className="text-xs text-slate-600 hover:text-red-600 font-semibold flex items-center gap-1"
                  >
                    <Trash2 className="w-3 h-3" />
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Notification Settings */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white border border-olive-200 rounded-xl p-6 shadow-md"
      >
        <h2 className="text-xl font-bold text-slate-900 mb-6">Notification Preferences</h2>
        <div className="space-y-4">
          {[
            { label: 'High Risk Alerts', description: 'Get notified immediately for high-risk personnel', enabled: true },
            { label: 'Deployment Updates', description: 'Receive alerts for deployment completions', enabled: true },
            { label: 'Intervention Success', description: 'Positive updates on personnel recovery', enabled: true },
            { label: 'System Maintenance', description: 'Maintenance windows and updates', enabled: false },
          ].map((pref, idx) => (
            <div key={idx} className="flex items-center justify-between p-3 border border-slate-200 rounded-lg hover:bg-slate-50">
              <div>
                <p className="font-semibold text-slate-900">{pref.label}</p>
                <p className="text-sm text-slate-600">{pref.description}</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" defaultChecked={pref.enabled} className="sr-only peer" />
                <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-olive-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-olive-600"></div>
              </label>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};
