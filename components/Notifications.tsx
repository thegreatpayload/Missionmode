
import React from 'react';
import type { Notification } from '../types';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, CheckCheck } from 'lucide-react';

interface NotificationsProps {
    notifications: Notification[];
    setNotifications: React.Dispatch<React.SetStateAction<Notification[]>>;
}

const Notifications: React.FC<NotificationsProps> = ({ notifications, setNotifications }) => {
    const markAllAsRead = () => {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    };

    const unreadCount = notifications.filter(n => !n.read).length;

    return (
        <div className="max-w-4xl mx-auto p-4">
             <div className="flex justify-between items-center mb-6">
                 <h1 className="text-3xl font-bold flex items-center gap-3">
                    <Bell size={32} className="text-indigo-500" />
                    Notifications
                </h1>
                {unreadCount > 0 && (
                    <button 
                        onClick={markAllAsRead} 
                        className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors text-sm"
                    >
                        <CheckCheck size={16} /> Mark all as read
                    </button>
                )}
             </div>

             <div className="space-y-3">
                <AnimatePresence>
                {notifications.length > 0 ? notifications.map(notif => (
                    <motion.div
                        key={notif.id}
                        layout
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className={`p-4 rounded-xl shadow-md flex items-start gap-4 transition-colors ${
                            notif.read ? 'bg-white/70 dark:bg-gray-800/50 opacity-70' : 'bg-white dark:bg-gray-800'
                        }`}
                    >
                        <div className={`mt-1 flex-shrink-0 w-2.5 h-2.5 rounded-full ${notif.read ? 'bg-transparent' : 'bg-blue-500'}`}></div>
                        <div className="flex-grow">
                            <p className="text-gray-800 dark:text-gray-200">{notif.message}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                {new Date(notif.timestamp).toLocaleString()}
                            </p>
                        </div>
                    </motion.div>
                )) : (
                    <div className="text-center py-16 text-gray-500 dark:text-gray-400">
                        <Bell size={48} className="mx-auto mb-4" />
                        <h2 className="text-xl font-semibold">All caught up!</h2>
                        <p>You have no new notifications.</p>
                    </div>
                )}
                </AnimatePresence>
             </div>
        </div>
    );
};

export default Notifications;
