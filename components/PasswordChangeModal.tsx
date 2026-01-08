
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ShieldAlert } from 'lucide-react';

interface PasswordChangeModalProps {
    onPasswordChange: (newPassword: string) => void;
}

const PasswordChangeModal: React.FC<PasswordChangeModalProps> = ({ onPasswordChange }) => {
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (newPassword.length < 4) {
            setError('Password must be at least 4 characters long.');
            return;
        }
        if (newPassword !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }
        if (newPassword === 'admin') {
            setError('New password cannot be the default password.');
            return;
        }
        setError('');
        onPasswordChange(newPassword);
    };

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
            <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 w-full max-w-md"
            >
                <div className="text-center mb-6">
                    <ShieldAlert size={48} className="mx-auto text-red-500 mb-4" />
                    <h2 className="text-2xl font-bold">Security Update Required</h2>
                    <p className="text-gray-500 dark:text-gray-400 mt-2">
                        For your security, you must change the default administrator password before proceeding.
                    </p>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">New Password</label>
                        <input
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            required
                            className="mt-1 w-full p-3 rounded-md bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-indigo-500 outline-none"
                        />
                    </div>
                    <div>
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Confirm New Password</label>
                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                            className="mt-1 w-full p-3 rounded-md bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-indigo-500 outline-none"
                        />
                    </div>
                    {error && <p className="text-red-500 text-sm text-center">{error}</p>}
                    <button type="submit" className="w-full bg-indigo-600 text-white font-semibold py-3 rounded-md hover:bg-indigo-700 transition-colors text-lg mt-2">
                        Set New Password
                    </button>
                </form>
            </motion.div>
        </div>
    );
};

export default PasswordChangeModal;
